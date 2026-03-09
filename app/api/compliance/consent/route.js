import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import ConsentEvidenceLog from "@/models/ConsentEvidenceLog";
import Booking from "@/models/Booking";
import { writeAuditLog } from "@/lib/audit";

const ALLOWED_TYPES = new Set(["age_attestation", "consent_attestation", "policy_ack", "kyc_age_check"]);
const ALLOWED_SOURCES = new Set(["booking_checkout", "explicit_form", "onboarding_kyc", "system"]);

function normalizeIp(req) {
  return req?.headers?.get?.("x-forwarded-for")?.split(",")?.[0]?.trim?.() || "";
}

export async function GET(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 100), 1), 500);
  const evidenceType = String(searchParams.get("evidenceType") || "").trim();
  const targetUserId = String(searchParams.get("userId") || "").trim();
  const bookingId = String(searchParams.get("bookingId") || "").trim();

  const filter = {};
  if (user.role !== "admin") {
    filter.userId = user.userId;
  } else if (targetUserId && mongoose.Types.ObjectId.isValid(targetUserId)) {
    filter.userId = targetUserId;
  }

  if (evidenceType && ALLOWED_TYPES.has(evidenceType)) {
    filter.evidenceType = evidenceType;
  }
  if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
    filter.bookingId = bookingId;
  }

  const logs = await ConsentEvidenceLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  const summary = logs.reduce(
    (acc, row) => {
      acc.total += 1;
      acc.byType[row.evidenceType] = (acc.byType[row.evidenceType] || 0) + 1;
      if (row.accepted) acc.accepted += 1;
      return acc;
    },
    {
      total: 0,
      accepted: 0,
      byType: { age_attestation: 0, consent_attestation: 0, policy_ack: 0, kyc_age_check: 0 },
    }
  );

  const res = NextResponse.json({ ok: true, logs, summary });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const bookingId = String(body.bookingId || "").trim();
  const source = ALLOWED_SOURCES.has(String(body.source || "").trim()) ? String(body.source).trim() : "explicit_form";
  const rawEntries = Array.isArray(body.entries) ? body.entries : body.evidenceType ? [body] : [];

  if (rawEntries.length === 0) {
    return NextResponse.json({ ok: false, error: "At least one consent evidence entry is required" }, { status: 400 });
  }

  let normalizedBookingId = null;
  if (bookingId) {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
    }
    const booking = await Booking.findById(bookingId).select("userId workerId").lean();
    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
    }
    const canUse =
      user.role === "admin" ||
      booking.userId?.toString() === user.userId ||
      booking.workerId?.toString() === user.userId;
    if (!canUse) {
      return NextResponse.json({ ok: false, error: "Forbidden for this booking" }, { status: 403 });
    }
    normalizedBookingId = bookingId;
  }

  const ip = normalizeIp(req);
  const userAgent = req?.headers?.get?.("user-agent") || "";
  const entries = [];
  for (const entry of rawEntries) {
    const evidenceType = String(entry.evidenceType || "").trim();
    if (!ALLOWED_TYPES.has(evidenceType)) {
      return NextResponse.json({ ok: false, error: `Invalid evidenceType: ${evidenceType}` }, { status: 400 });
    }
    entries.push({
      userId: user.userId,
      userRole: user.role,
      bookingId: normalizedBookingId,
      evidenceType,
      accepted: entry.accepted !== false,
      statement: String(entry.statement || "").trim(),
      source,
      evidenceFiles: Array.isArray(entry.evidenceFiles) ? entry.evidenceFiles.filter(Boolean).slice(0, 10) : [],
      geoSnapshot: {
        city: String(entry?.geoSnapshot?.city || "").trim(),
        state: String(entry?.geoSnapshot?.state || "").trim(),
        pincode: String(entry?.geoSnapshot?.pincode || "").trim(),
        country: String(entry?.geoSnapshot?.country || "").trim(),
      },
      metadata: entry?.metadata && typeof entry.metadata === "object" ? entry.metadata : {},
      ip,
      userAgent,
    });
  }

  try {
    const logs = await ConsentEvidenceLog.insertMany(entries, { ordered: true });
    await writeAuditLog({
      actorId: user.userId,
      actorRole: user.role,
      action: "compliance.consent.log",
      targetType: "consent_evidence",
      targetId: logs?.[0]?._id || null,
      metadata: {
        count: logs.length,
        bookingId: normalizedBookingId,
        evidenceTypes: logs.map((row) => row.evidenceType),
      },
      req,
    });
    const res = NextResponse.json({ ok: true, logs });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to create consent evidence logs" }, { status: 400 });
  }
}

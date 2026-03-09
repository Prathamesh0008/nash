import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import PanicAlert from "@/models/PanicAlert";
import Booking from "@/models/Booking";
import Conversation from "@/models/Conversation";
import SupportTicket from "@/models/SupportTicket";
import User from "@/models/User";
import { notifyAdmins, createNotification } from "@/lib/notify";
import { createRiskSignal } from "@/lib/riskSignals";
import { writeAuditLog } from "@/lib/audit";

const PANIC_SLA_MINUTES = Math.max(1, Number(process.env.PANIC_FIRST_RESPONSE_SLA_MINUTES || 10));

function buildAlertNo() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PAN-${stamp}-${rand}`;
}

function buildTicketNo() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TKT-${stamp}-${rand}`;
}

function getIp(req) {
  return req?.headers?.get?.("x-forwarded-for")?.split(",")?.[0]?.trim?.() || "";
}

function sanitizeLocation(location = {}) {
  return {
    city: String(location.city || "").trim(),
    state: String(location.state || "").trim(),
    pincode: String(location.pincode || "").trim(),
    lat: Number.isFinite(Number(location.lat)) ? Number(location.lat) : null,
    lng: Number.isFinite(Number(location.lng)) ? Number(location.lng) : null,
  };
}

export async function GET(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const status = String(searchParams.get("status") || "").trim();
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 100), 1), 300);
  const filter = {};
  if (status && ["open", "acknowledged", "in_progress", "resolved", "escalated", "false_alarm"].includes(status)) {
    filter.status = status;
  }
  if (user.role !== "admin") {
    filter.raisedBy = user.userId;
  }

  const alerts = await PanicAlert.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  const userIds = [...new Set(alerts.flatMap((row) => [row.raisedBy?.toString(), row.assignedTo?.toString()]).filter(Boolean))];
  const users = await User.find({ _id: { $in: userIds } }).select("name email phone role").lean();
  const userMap = new Map(users.map((row) => [row._id.toString(), row]));

  const now = Date.now();
  const rows = alerts.map((row) => {
    const dueAtMs = row?.slaFirstResponseDueAt ? new Date(row.slaFirstResponseDueAt).getTime() : null;
    const firstResponseMissing = !row.firstResponseAt && ["open", "acknowledged", "in_progress", "escalated"].includes(row.status);
    return {
      ...row,
      raisedByUser: userMap.get(row.raisedBy?.toString()) || null,
      assignedAdmin: userMap.get(row.assignedTo?.toString()) || null,
      slaBreached: firstResponseMissing && typeof dueAtMs === "number" ? dueAtMs < now : false,
      slaRemainingMs: typeof dueAtMs === "number" ? dueAtMs - now : null,
    };
  });

  const summary = rows.reduce(
    (acc, row) => {
      acc.total += 1;
      acc.byStatus[row.status] = (acc.byStatus[row.status] || 0) + 1;
      if (row.slaBreached) acc.slaBreached += 1;
      return acc;
    },
    {
      total: 0,
      slaBreached: 0,
      byStatus: { open: 0, acknowledged: 0, in_progress: 0, resolved: 0, escalated: 0, false_alarm: 0 },
    }
  );

  const res = NextResponse.json({ ok: true, alerts: rows, summary });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  const bookingId = String(body.bookingId || "").trim();
  const conversationId = String(body.conversationId || "").trim();
  const triggerSource = String(body.triggerSource || "panic_button").trim() || "panic_button";
  const attachments = Array.isArray(body.attachments) ? body.attachments.filter(Boolean).slice(0, 8) : [];
  const location = sanitizeLocation(body.location || {});

  if (message.length < 8) {
    return NextResponse.json({ ok: false, error: "Panic message must be at least 8 characters" }, { status: 400 });
  }

  let normalizedBookingId = null;
  if (bookingId) {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
    }
    const booking = await Booking.findById(bookingId).select("userId workerId").lean();
    if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
    const canUse =
      user.role === "admin" ||
      booking.userId?.toString() === user.userId ||
      booking.workerId?.toString() === user.userId;
    if (!canUse) return NextResponse.json({ ok: false, error: "Forbidden for this booking" }, { status: 403 });
    normalizedBookingId = bookingId;
  }

  let normalizedConversationId = null;
  if (conversationId) {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json({ ok: false, error: "Invalid conversation id" }, { status: 400 });
    }
    const conversation = await Conversation.findById(conversationId).select("userId workerUserId").lean();
    if (!conversation) return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 });
    const canUse =
      user.role === "admin" ||
      conversation.userId?.toString() === user.userId ||
      conversation.workerUserId?.toString() === user.userId;
    if (!canUse) return NextResponse.json({ ok: false, error: "Forbidden for this conversation" }, { status: 403 });
    normalizedConversationId = conversationId;
  }

  const now = new Date();
  const dueAt = new Date(now.getTime() + PANIC_SLA_MINUTES * 60 * 1000);

  const alert = await PanicAlert.create({
    alertNo: buildAlertNo(),
    raisedBy: user.userId,
    raisedByRole: user.role,
    bookingId: normalizedBookingId,
    conversationId: normalizedConversationId,
    message,
    severity: "critical",
    status: "open",
    location,
    attachments,
    triggerSource,
    slaFirstResponseDueAt: dueAt,
    timeline: [
      {
        action: "raised",
        actorId: user.userId,
        actorRole: user.role,
        note: message,
        at: now,
      },
    ],
    meta: {
      ip: getIp(req),
      userAgent: req?.headers?.get?.("user-agent") || "",
    },
  });

  const ticket = await SupportTicket.create({
    ticketNo: buildTicketNo(),
    userId: user.userId,
    userRole: user.role,
    bookingId: normalizedBookingId,
    subject: `PANIC ALERT ${alert.alertNo}`,
    category: "panic",
    priority: "critical",
    message,
    attachments,
    status: "open",
    slaFirstResponseDueAt: dueAt,
    lastReplyAt: now,
    auditTrail: [
      {
        action: "ticket_created",
        actorId: user.userId,
        actorRole: user.role,
        note: "Panic ticket auto-created from panic alert",
        at: now,
      },
    ],
  });

  alert.ticketId = ticket._id;
  alert.timeline.push({
    action: "linked_ticket",
    actorId: user.userId,
    actorRole: "system",
    note: ticket.ticketNo,
    at: new Date(),
    metadata: { ticketId: ticket._id.toString(), ticketNo: ticket.ticketNo },
  });
  await alert.save();

  await notifyAdmins({
    actorId: user.userId,
    type: "status",
    title: `PANIC ALERT ${alert.alertNo}`,
    body: `${user.role.toUpperCase()} raised panic alert. Immediate moderation required.`,
    href: "/admin/support",
    meta: {
      panicAlertId: alert._id.toString(),
      alertNo: alert.alertNo,
      ticketId: ticket._id.toString(),
      ticketNo: ticket.ticketNo,
      dueAt: dueAt.toISOString(),
    },
  });

  await createNotification({
    userId: user.userId,
    actorId: user.userId,
    type: "system",
    title: `Panic alert raised (${alert.alertNo})`,
    body: "Safety team has been notified and will respond immediately.",
    href: "/support",
    meta: { panicAlertId: alert._id.toString(), alertNo: alert.alertNo, ticketNo: ticket.ticketNo },
  });

  await createRiskSignal({
    userId: user.userId,
    bookingId: normalizedBookingId || null,
    signalType: "panic_alert",
    severity: "critical",
    reasons: ["panic_button_triggered"],
    meta: {
      panicAlertId: alert._id.toString(),
      ticketId: ticket._id.toString(),
      triggerSource,
    },
    actorId: user.userId,
    actorRole: user.role,
    req,
  });

  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role,
    action: "safety.panic.raise",
    targetType: "panic_alert",
    targetId: alert._id,
    metadata: {
      alertNo: alert.alertNo,
      ticketNo: ticket.ticketNo,
      bookingId: normalizedBookingId,
    },
    req,
  });

  const res = NextResponse.json({ ok: true, alert, ticket });
  return applyRefreshCookies(res, refreshedResponse);
}

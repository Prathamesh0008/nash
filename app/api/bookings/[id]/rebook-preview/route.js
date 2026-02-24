import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { calculatePriceBreakup } from "@/lib/pricing";
import { writeAuditLog } from "@/lib/audit";
import {
  evaluateRebookEligibility,
  evaluateSameWorkerForRebook,
  getDefaultRebookSlot,
  isRebookEnabled,
} from "@/lib/rebook";

function canAccessBooking(booking, user) {
  if (!booking || !user) return false;
  if (user.role === "admin") return true;
  return booking.userId?.toString() === user.userId;
}

export async function GET(_req, context) {
  if (!isRebookEnabled()) {
    return NextResponse.json({ ok: false, error: "Rebook feature is disabled" }, { status: 404 });
  }

  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
  }

  const sourceBooking = await Booking.findById(id)
    .select("userId workerId serviceId status address slotTime selectedAddons priceBreakup paymentMethod paymentStatus isRebook rebookVersion")
    .lean();
  if (!sourceBooking) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  }

  if (!canAccessBooking(sourceBooking, user)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const service = await Service.findById(sourceBooking.serviceId).lean();
  if (!service || !service.active) {
    return NextResponse.json({ ok: false, error: "Service is not available for rebook" }, { status: 404 });
  }

  const eligibility = evaluateRebookEligibility(sourceBooking);
  const suggestedSlot = getDefaultRebookSlot(sourceBooking.slotTime);
  const selectedAddons = Array.isArray(sourceBooking.selectedAddons) ? sourceBooking.selectedAddons : [];
  const priceBreakup = calculatePriceBreakup({ service, selectedAddons });

  const sameWorker = eligibility.eligible && sourceBooking.workerId
    ? await evaluateSameWorkerForRebook({
        workerId: sourceBooking.workerId,
        serviceCategory: service.category,
        address: sourceBooking.address,
        slotTime: suggestedSlot,
      })
    : { available: false, reason: "No previous worker found" };
  const warnings = [
    ...(Array.isArray(eligibility.warnings) ? eligibility.warnings : []),
    ...(sourceBooking.workerId && !sameWorker.available && sameWorker.reason
      ? [{ code: "SAME_WORKER_UNAVAILABLE", message: sameWorker.reason }]
      : []),
  ];

  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role,
    action: "booking.rebook.preview",
    targetType: "booking",
    targetId: sourceBooking._id,
    metadata: {
      eligible: eligibility.eligible,
      reasonCodes: (eligibility.reasons || []).map((row) => row.code),
      warningCodes: warnings.map((row) => row.code),
      sameWorkerAvailable: Boolean(sameWorker.available),
      serviceId: String(service._id),
      suggestedSlotTime: suggestedSlot.toISOString(),
    },
    req: _req,
  }).catch(() => null);

  const res = NextResponse.json({
    ok: true,
    preview: {
      sourceBookingId: sourceBooking._id,
      suggestedSlotTime: suggestedSlot.toISOString(),
      selectedAddons,
      paymentMethod: sourceBooking.paymentMethod || "online",
      priceBreakup,
      service: {
        id: service._id,
        title: service.title,
        category: service.category,
      },
      sameWorker: {
        available: Boolean(sameWorker.available),
        reason: sameWorker.reason || "",
      },
      eligibility: {
        eligible: Boolean(eligibility.eligible),
        reasons: eligibility.reasons || [],
        warnings,
      },
      recommendedWorkerPreference: sameWorker.available ? "same" : "auto",
    },
  });
  return applyRefreshCookies(res, refreshedResponse);
}

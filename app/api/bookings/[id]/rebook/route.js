import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import Payment from "@/models/Payment";
import Conversation from "@/models/Conversation";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { writeAuditLog } from "@/lib/audit";
import { calculatePriceBreakup } from "@/lib/pricing";
import { matchWorkerForBooking } from "@/lib/matching";
import { adjustWallet } from "@/lib/wallet";
import { createNotification } from "@/lib/notify";
import {
  evaluateRebookEligibility,
  evaluateSameWorkerForRebook,
  getDefaultRebookSlot,
  isRebookEnabled,
  parseRebookSlot,
  REBOOK_ACTIVE_SLOT_STATUSES,
  validateRebookSlotWindow,
} from "@/lib/rebook";

function canAccessBooking(booking, user) {
  if (!booking || !user) return false;
  if (user.role === "admin") return true;
  return booking.userId?.toString() === user.userId;
}

function normalizeWorkerPreference(value, fallback = "same") {
  const raw = String(value || fallback).trim().toLowerCase();
  return raw === "auto" ? "auto" : "same";
}

function normalizePaymentMethod(value, fallback = "online") {
  const raw = String(value || fallback).trim().toLowerCase();
  if (raw === "wallet") return "wallet";
  if (raw === "cod") return "cod";
  return "online";
}

function toNote(sourceBookingId) {
  return `Rebooked from order #${String(sourceBookingId || "").slice(-6)}`;
}

async function safeRebookAudit({ req, user, sourceBookingId, action, metadata = {} }) {
  if (!user?.userId || !sourceBookingId || !action) return;
  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role || "user",
    action,
    targetType: "booking",
    targetId: sourceBookingId,
    metadata,
    req,
  }).catch(() => null);
}

export async function POST(req, context) {
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

  const sourceBooking = await Booking.findById(id).lean();
  if (!sourceBooking) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  }
  if (!canAccessBooking(sourceBooking, user)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const bookingOwnerId = String(sourceBooking.userId || "");
  if (!bookingOwnerId) {
    return NextResponse.json({ ok: false, error: "Invalid source booking owner" }, { status: 400 });
  }
  const eligibility = evaluateRebookEligibility(sourceBooking);
  if (!eligibility.eligible) {
    await safeRebookAudit({
      req,
      user,
      sourceBookingId: sourceBooking._id,
      action: "booking.rebook.blocked",
      metadata: {
        code: "REBOOK_NOT_ELIGIBLE",
        reasonCodes: (eligibility.reasons || []).map((row) => row.code),
      },
    });
    return NextResponse.json(
      {
        ok: false,
        error: eligibility.reasons?.[0]?.message || "Source booking is not eligible for rebook",
        code: "REBOOK_NOT_ELIGIBLE",
        eligibility,
      },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const idempotencyKey = (req.headers.get("x-idempotency-key") || body.idempotencyKey || "").trim().slice(0, 128);

  await safeRebookAudit({
    req,
    user,
    sourceBookingId: sourceBooking._id,
    action: "booking.rebook.submit",
    metadata: {
      idempotencyKeyPresent: Boolean(idempotencyKey),
      workerPreference: String(body.workerPreference || "same"),
      paymentMethod: String(body.paymentMethod || sourceBooking.paymentMethod || "online"),
      slotTime: String(body.slotTime || ""),
    },
  });

  if (idempotencyKey) {
    const existing = await Booking.findOne({ userId: bookingOwnerId, idempotencyKey }).lean();
    if (existing) {
      await safeRebookAudit({
        req,
        user,
        sourceBookingId: sourceBooking._id,
        action: "booking.rebook.idempotent",
        metadata: { bookingId: String(existing._id) },
      });
      const res = NextResponse.json({ ok: true, booking: existing, idempotent: true });
      return applyRefreshCookies(res, refreshedResponse);
    }
  }

  const service = await Service.findById(sourceBooking.serviceId).lean();
  if (!service || !service.active) {
    return NextResponse.json({ ok: false, error: "Service is not available for rebook" }, { status: 404 });
  }

  const fallbackSlot = getDefaultRebookSlot(sourceBooking.slotTime);
  const slotTime = parseRebookSlot(body.slotTime, fallbackSlot);
  if (!slotTime) {
    return NextResponse.json({ ok: false, error: "Invalid slot time" }, { status: 400 });
  }
  if (slotTime.getTime() <= Date.now() + 60 * 1000) {
    return NextResponse.json({ ok: false, error: "Please select a future slot time" }, { status: 400 });
  }
  const slotWindow = validateRebookSlotWindow(slotTime);
  if (!slotWindow.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Please choose a slot within ${String(process.env.REBOOK_MAX_FUTURE_SLOT_DAYS || 60)} days`,
        code: "REBOOK_SLOT_TOO_FAR",
        maxAllowedAt: slotWindow.maxAllowedAt ? slotWindow.maxAllowedAt.toISOString() : null,
      },
      { status: 400 }
    );
  }

  const userSlotConflict = await Booking.findOne({
    userId: sourceBooking.userId,
    slotTime,
    status: { $in: REBOOK_ACTIVE_SLOT_STATUSES },
  }).lean();
  if (userSlotConflict) {
    await safeRebookAudit({
      req,
      user,
      sourceBookingId: sourceBooking._id,
      action: "booking.rebook.blocked",
      metadata: {
        code: "REBOOK_SLOT_CONFLICT",
        conflictBookingId: String(userSlotConflict._id),
        slotTime: slotTime.toISOString(),
      },
    });
    return NextResponse.json(
      {
        ok: false,
        error: "You already have an active booking at this slot. Please choose another time.",
        bookingId: userSlotConflict._id,
      },
      { status: 409 }
    );
  }

  const workerPreference = normalizeWorkerPreference(body.workerPreference, "same");
  const strictSameWorker = workerPreference === "same" ? body.strictSameWorker !== false : false;
  const paymentMethod = normalizePaymentMethod(body.paymentMethod, sourceBooking.paymentMethod || "online");
  const selectedAddons = Array.isArray(sourceBooking.selectedAddons) ? sourceBooking.selectedAddons : [];
  const priceBreakup = calculatePriceBreakup({ service, selectedAddons });

  let workerId = null;
  let assignmentMode = "auto";
  let assignmentReason = "Auto assignment pending";

  if (workerPreference === "same" && sourceBooking.workerId) {
    const sameWorker = await evaluateSameWorkerForRebook({
      workerId: sourceBooking.workerId,
      serviceCategory: service.category,
      address: sourceBooking.address,
      slotTime,
      excludeBookingId: sourceBooking._id,
    });

    if (sameWorker.available) {
      workerId = sourceBooking.workerId;
      assignmentMode = "manual";
      assignmentReason = "Rebooked with previous worker";
    } else if (strictSameWorker) {
      await safeRebookAudit({
        req,
        user,
        sourceBookingId: sourceBooking._id,
        action: "booking.rebook.blocked",
        metadata: {
          code: "REBOOK_SAME_WORKER_UNAVAILABLE",
          reason: sameWorker.reason || "",
          slotTime: slotTime.toISOString(),
        },
      });
      return NextResponse.json(
        {
          ok: false,
          error: sameWorker.reason || "Previous worker is unavailable for selected slot",
          code: "REBOOK_SAME_WORKER_UNAVAILABLE",
          sameWorker: { available: false, reason: sameWorker.reason || "" },
        },
        { status: 409 }
      );
    } else {
      assignmentReason = `Previous worker unavailable: ${sameWorker.reason || "fallback to auto match"}`;
    }
  }

  if (!workerId) {
    const matched = await matchWorkerForBooking({
      category: service.category,
      areaPincode: sourceBooking.address?.pincode || "",
      areaCity: sourceBooking.address?.city || "",
      slotTime,
      excludeWorkerIds: sourceBooking.workerId ? [sourceBooking.workerId] : [],
    });
    if (matched?.worker?.userId) {
      workerId = matched.worker.userId;
      assignmentMode = "auto";
      assignmentReason = `Auto matched for rebook (score ${Number(matched.score || 0).toFixed(2)})`;
    }
  }

  let paymentId = null;
  let paymentStatus = "unpaid";

  if (paymentMethod === "wallet") {
    await adjustWallet({
      userId: sourceBooking.userId,
      ownerType: "user",
      direction: "debit",
      reason: "booking_payment",
      amount: priceBreakup.total,
      referenceType: "booking",
    });
    paymentStatus = "paid";
  } else if (paymentMethod === "online") {
    const payment = await Payment.create({
      userId: sourceBooking.userId,
      workerId,
      type: "booking",
      amount: priceBreakup.total,
      status: "paid",
      provider: "demo",
      providerPaymentId: `demo_rebook_${Date.now()}`,
      metadata: {
        sourceBookingId: String(sourceBooking._id),
      },
    });
    paymentId = payment._id;
    paymentStatus = "paid";
  }

  const rootSourceBookingId = sourceBooking.sourceBookingId || sourceBooking._id;
  const rebookVersion = Math.max(1, Number(sourceBooking.rebookVersion || 0) + 1);

  try {
    const booking = await Booking.create({
      userId: sourceBooking.userId,
      workerId,
      serviceId: sourceBooking.serviceId,
      address: sourceBooking.address,
      slotTime,
      notes: String(body.notes || "").trim() || toNote(rootSourceBookingId),
      images: [],
      selectedAddons,
      status: workerId ? "assigned" : "confirmed",
      statusLogs: [
        {
          status: "confirmed",
          actorRole: user.role,
          actorId: user.userId,
          note: "Rebook confirmed",
        },
        ...(workerId
          ? [
              {
                status: "assigned",
                actorRole: "system",
                note: "Worker assigned for rebook",
              },
            ]
          : []),
      ],
      assignmentMode,
      assignmentReason,
      strictWorker: workerPreference === "same",
      requestedWorkerId: workerPreference === "same" ? sourceBooking.workerId || null : null,
      priceBreakup: { ...priceBreakup, discount: 0, total: priceBreakup.total },
      paymentMethod,
      paymentStatus,
      paymentId,
      idempotencyKey: idempotencyKey || undefined,
      sourceBookingId: rootSourceBookingId,
      isRebook: true,
      rebookVersion,
    });

    if (workerId) {
      const conversation = await Conversation.findOneAndUpdate(
        {
          bookingId: booking._id,
          userId: booking.userId,
          workerUserId: workerId,
        },
        {
          $setOnInsert: {
            bookingId: booking._id,
            userId: booking.userId,
            workerUserId: workerId,
          },
          $set: { lastMessageAt: new Date() },
        },
        { upsert: true, new: true }
      );

      booking.conversationId = conversation._id;
      await booking.save();
    }

    await createNotification({
      userId: booking.userId,
      actorId: user.userId,
      type: "status",
      title: workerId ? "Rebook confirmed and worker assigned" : "Rebook confirmed",
      body: `Rebook scheduled for ${new Date(booking.slotTime).toLocaleString()}`,
      href: `/orders/${booking._id}`,
      meta: { bookingId: booking._id.toString(), sourceBookingId: String(rootSourceBookingId), rebook: true },
    });

    if (workerId) {
      await createNotification({
        userId: workerId,
        actorId: user.userId,
        type: "status",
        title: "New rebook job assigned",
        body: `You have a rebooked ${service.title} job.`,
        href: `/worker/jobs/${booking._id}`,
        meta: { bookingId: booking._id.toString(), sourceBookingId: String(rootSourceBookingId), rebook: true },
      });
    }

    const res = NextResponse.json({
      ok: true,
      booking,
      rebookedFrom: {
        bookingId: sourceBooking._id,
        workerPreference,
      },
    });
    await safeRebookAudit({
      req,
      user,
      sourceBookingId: sourceBooking._id,
      action: "booking.rebook.created",
      metadata: {
        bookingId: String(booking._id),
        workerPreference,
        assignmentMode,
        paymentMethod,
        paymentStatus,
      },
    });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    if (error?.code === 11000) {
      if (idempotencyKey) {
        const retryBooking = await Booking.findOne({ userId: bookingOwnerId, idempotencyKey }).lean();
        if (retryBooking) {
          await safeRebookAudit({
            req,
            user,
            sourceBookingId: sourceBooking._id,
            action: "booking.rebook.idempotent",
            metadata: { bookingId: String(retryBooking._id), duplicateKeyError: true },
          });
          const res = NextResponse.json({ ok: true, booking: retryBooking, idempotent: true });
          return applyRefreshCookies(res, refreshedResponse);
        }
      }
      return NextResponse.json({ ok: false, error: "Duplicate rebook request" }, { status: 409 });
    }
    await safeRebookAudit({
      req,
      user,
      sourceBookingId: sourceBooking._id,
      action: "booking.rebook.error",
      metadata: { message: error?.message || "Rebook failed" },
    });
    return NextResponse.json({ ok: false, error: error?.message || "Rebook failed" }, { status: 400 });
  }
}

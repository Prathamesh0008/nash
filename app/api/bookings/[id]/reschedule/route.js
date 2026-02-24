import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import ReschedulePolicy from "@/models/ReschedulePolicy";
import RescheduleLog from "@/models/RescheduleLog";
import Payment from "@/models/Payment";
import WorkerProfile from "@/models/WorkerProfile";
import { calculateRescheduleFee } from "@/lib/pricing";
import { rescheduleSchema, parseOrThrow } from "@/lib/validators";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { adjustWallet } from "@/lib/wallet";
import { enforceRateLimit, getRateLimitKey } from "@/lib/rateLimit";
import { createNotification } from "@/lib/notify";
import { isWorkerAvailableForSlot } from "@/lib/availability";

export async function POST(req, context) {
  const rl = await enforceRateLimit({
    key: getRateLimitKey(req, "reschedule"),
    limit: 8,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) return NextResponse.json({ ok: false, error: "Too many reschedule requests" }, { status: 429 });

  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
  }

  try {
    const data = parseOrThrow(rescheduleSchema, await req.json());

    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });

    const canAccess = user.role === "admin" || booking.userId?.toString() === user.userId;
    if (!canAccess) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const policy =
      (await ReschedulePolicy.findOne({ active: true }).sort({ updatedAt: -1 }).lean()) ||
      (await ReschedulePolicy.create({})).toObject();

    const fee = calculateRescheduleFee({
      policy,
      bookingStatus: booking.status,
      oldSlot: booking.slotTime,
      newSlot: data.newSlotTime,
    });

    if (booking.workerId) {
      const workerProfile = await WorkerProfile.findOne({ userId: booking.workerId }).lean();
      if (workerProfile && !isWorkerAvailableForSlot(workerProfile, data.newSlotTime)) {
        return NextResponse.json(
          { ok: false, error: "Assigned worker is unavailable at selected slot. Please choose another slot." },
          { status: 409 }
        );
      }

      const workerConflict = await Booking.findOne({
        _id: { $ne: booking._id },
        workerId: booking.workerId,
        slotTime: new Date(data.newSlotTime),
        status: { $in: ["assigned", "onway", "working", "confirmed"] },
      }).lean();
      if (workerConflict) {
        return NextResponse.json({ ok: false, error: "Worker already has another booking at selected slot." }, { status: 409 });
      }
    }

    let payment = null;

    if (fee > 0) {
      if (data.payVia === "wallet") {
        await adjustWallet({
          userId: booking.userId,
          ownerType: "user",
          direction: "debit",
          reason: "reschedule_fee",
          amount: fee,
          referenceType: "booking",
          referenceId: booking._id,
        });
      } else {
        payment = await Payment.create({
          userId: booking.userId,
          bookingId: booking._id,
          workerId: booking.workerId,
          type: "reschedule",
          amount: fee,
          status: "paid",
          provider: "demo",
          providerPaymentId: `demo_res_${Date.now()}`,
        });
      }
    }

    const oldSlot = booking.slotTime;
    booking.slotTime = new Date(data.newSlotTime);
    booking.rescheduleCount += 1;
    booking.statusLogs.push({
      status: booking.status,
      actorRole: user.role,
      actorId: user.userId,
      note: `Rescheduled with fee INR ${fee}`,
    });
    await booking.save();

    const rescheduleLog = await RescheduleLog.create({
      bookingId: booking._id,
      oldSlot,
      newSlot: booking.slotTime,
      fee,
      paidVia: fee === 0 ? "waived" : data.payVia,
      createdBy: user.userId,
    });

    if (booking.userId && booking.userId.toString() !== user.userId) {
      await createNotification({
        userId: booking.userId,
        actorId: user.userId,
        type: "status",
        title: "Booking rescheduled",
        body: `New slot: ${new Date(booking.slotTime).toLocaleString()} | Fee: INR ${fee}`,
        href: `/orders/${booking._id}`,
        meta: { bookingId: booking._id.toString(), fee },
      });
    }

    if (booking.workerId && booking.workerId.toString() !== user.userId) {
      await createNotification({
        userId: booking.workerId,
        actorId: user.userId,
        type: "status",
        title: "Job schedule updated",
        body: `Customer changed slot to ${new Date(booking.slotTime).toLocaleString()}.`,
        href: `/worker/jobs/${booking._id}`,
        meta: { bookingId: booking._id.toString(), fee },
      });
    }

    const res = NextResponse.json({ ok: true, booking, fee, payment, rescheduleLog });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Reschedule failed" }, { status: error.status || 400 });
  }
}

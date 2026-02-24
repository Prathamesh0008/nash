import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Payment from "@/models/Payment";
import ReschedulePolicy from "@/models/ReschedulePolicy";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { calculateCancellationFee } from "@/lib/pricing";
import { adjustWallet } from "@/lib/wallet";
import { createNotification } from "@/lib/notify";
import { enforceRateLimit, getRateLimitKey } from "@/lib/rateLimit";

const CANCELLABLE_STATUSES = ["confirmed", "assigned", "onway"];

export async function POST(req, context) {
  const rl = await enforceRateLimit({
    key: getRateLimitKey(req, "booking_cancel"),
    limit: 8,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) return NextResponse.json({ ok: false, error: "Too many cancellation attempts" }, { status: 429 });

  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const payVia = body.payVia === "wallet" ? "wallet" : "online";

  const booking = await Booking.findById(id);
  if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });

  const canAccess = user.role === "admin" || booking.userId?.toString() === user.userId;
  if (!canAccess) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  if (!CANCELLABLE_STATUSES.includes(booking.status)) {
    return NextResponse.json({ ok: false, error: `Cancellation not allowed at status: ${booking.status}` }, { status: 400 });
  }

  const policy =
    (await ReschedulePolicy.findOne({ active: true }).sort({ updatedAt: -1 }).lean()) ||
    (await ReschedulePolicy.create({})).toObject();

  let fee = 0;
  try {
    fee = calculateCancellationFee({
      policy,
      bookingStatus: booking.status,
      slotTime: booking.slotTime,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Cancellation blocked" }, { status: 400 });
  }

  let payment = null;
  if (fee > 0) {
    if (payVia === "wallet") {
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
        providerPaymentId: `demo_cancel_${Date.now()}`,
      });
    }
  }

  booking.status = "cancelled";
  booking.statusLogs.push({
    status: "cancelled",
    actorRole: user.role,
    actorId: user.userId,
    note: `Cancelled with fee INR ${fee}`,
  });
  await booking.save();

  if (booking.workerId && booking.workerId.toString() !== user.userId) {
    await createNotification({
      userId: booking.workerId,
      actorId: user.userId,
      type: "status",
      title: "Booking cancelled by customer",
      body: `Order ${booking._id.toString().slice(-6)} was cancelled.`,
      href: `/worker/jobs/${booking._id}`,
      meta: { bookingId: booking._id.toString(), fee, status: "cancelled" },
    });
  }

  const res = NextResponse.json({ ok: true, booking, fee, payment, policy });
  return applyRefreshCookies(res, refreshedResponse);
}

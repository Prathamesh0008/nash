import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import { verifyPayment } from "@/lib/paymentService";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { paymentVerifySchema, parseOrThrow } from "@/lib/validators";
import { createNotification } from "@/lib/notify";
import { logError } from "@/lib/monitoring";

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  try {
    const data = parseOrThrow(paymentVerifySchema, await req.json());
    if (!mongoose.Types.ObjectId.isValid(data.paymentId)) {
      return NextResponse.json({ ok: false, error: "Invalid payment id" }, { status: 400 });
    }

    const payment = await Payment.findById(data.paymentId);
    if (!payment) return NextResponse.json({ ok: false, error: "Payment not found" }, { status: 404 });

    const canAccess = user.role === "admin" || payment.userId?.toString() === user.userId;
    if (!canAccess) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    if (!["failed", "created"].includes(payment.status)) {
      return NextResponse.json({ ok: false, error: "Only failed/created payments can be recovered" }, { status: 400 });
    }

    const verification = await verifyPayment({
      paymentToken: data.paymentToken,
      providerOrderId: data.providerOrderId || payment.providerOrderId,
      providerPaymentId: data.providerPaymentId,
      providerSignature: data.providerSignature,
      provider: data.provider || payment.provider,
    });

    payment.metadata = {
      ...payment.metadata,
      lastRecoveryAttemptAt: new Date().toISOString(),
      recoveredBy: user.userId,
      recoveredByRole: user.role,
    };

    if (!verification.ok) {
      payment.status = "failed";
      payment.metadata.lastRecoveryStatus = "failed";
      await payment.save();
      return NextResponse.json({ ok: false, error: "Recovery verification failed" }, { status: 400 });
    }

    payment.status = "paid";
    payment.providerOrderId = verification.providerOrderId || payment.providerOrderId;
    payment.providerPaymentId = verification.providerPaymentId || payment.providerPaymentId;
    payment.verifiedAt = payment.verifiedAt || new Date();
    payment.metadata.lastRecoveryStatus = "paid";
    await payment.save();

    if (payment.bookingId) {
      await Booking.updateOne(
        { _id: payment.bookingId },
        {
          $set: {
            paymentStatus: "paid",
            paymentId: payment._id,
          },
        }
      );
    }

    await createNotification({
      userId: payment.userId,
      actorId: user.userId,
      type: "status",
      title: "Payment recovered",
      body: `Your payment of INR ${payment.amount} has been successfully recovered.`,
      href: payment.bookingId ? `/orders/${payment.bookingId}` : "/wallet",
      meta: { paymentId: payment._id.toString(), status: "paid", recovered: true },
    });

    const res = NextResponse.json({ ok: true, payment, recovered: true });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    await logError("api.payments.recover", error, { actorId: user?.userId || "" });
    return NextResponse.json({ ok: false, error: error.message || "Payment recovery failed" }, { status: error.status || 400 });
  }
}

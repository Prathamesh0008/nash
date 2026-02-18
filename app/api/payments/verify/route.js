import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import { verifyPayment } from "@/lib/paymentService";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { paymentVerifySchema, parseOrThrow } from "@/lib/validators";

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

    if (payment.status === "paid") {
      const res = NextResponse.json({ ok: true, payment, idempotent: true });
      return applyRefreshCookies(res, refreshedResponse);
    }

    const verification = await verifyPayment({
      paymentToken: data.paymentToken,
      providerOrderId: data.providerOrderId || payment.providerOrderId,
      providerPaymentId: data.providerPaymentId,
      providerSignature: data.providerSignature,
      provider: data.provider || payment.provider,
    });
    if (!verification.ok) {
      payment.status = "failed";
      await payment.save();
      return NextResponse.json({ ok: false, error: "Payment verification failed" }, { status: 400 });
    }

    payment.status = "paid";
    payment.providerOrderId = verification.providerOrderId || payment.providerOrderId;
    payment.providerPaymentId = verification.providerPaymentId || data.paymentToken || payment.providerPaymentId;
    payment.verifiedAt = new Date();
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

    const res = NextResponse.json({ ok: true, payment });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to verify payment" }, { status: error.status || 400 });
  }
}

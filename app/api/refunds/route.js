import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { refundSchema, parseOrThrow } from "@/lib/validators";
import { adjustWallet } from "@/lib/wallet";
import { writeAuditLog } from "@/lib/audit";
import RefundAudit from "@/models/RefundAudit";
import { logError } from "@/lib/monitoring";

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  try {
    const data = parseOrThrow(refundSchema, await req.json());
    if (!mongoose.Types.ObjectId.isValid(data.paymentId)) {
      return NextResponse.json({ ok: false, error: "Invalid payment id" }, { status: 400 });
    }

    const payment = await Payment.findById(data.paymentId);
    if (!payment) return NextResponse.json({ ok: false, error: "Payment not found" }, { status: 404 });

    if (payment.status !== "paid") {
      return NextResponse.json({ ok: false, error: "Only paid payment can be refunded" }, { status: 400 });
    }

    const refundAmount = Number(data.amount || payment.amount);
    payment.status = "refunded";
    payment.refundedAt = new Date();
    payment.metadata = { ...payment.metadata, refundAmount, refundNote: data.note };
    await payment.save();

    await adjustWallet({
      userId: payment.userId,
      ownerType: "user",
      direction: "credit",
      reason: "refund",
      amount: refundAmount,
      referenceType: "payment",
      referenceId: payment._id,
      note: data.note,
    });

    if (payment.bookingId) {
      await Booking.updateOne({ _id: payment.bookingId }, { $set: { paymentStatus: "refunded" } });
    }

    await RefundAudit.create({
      paymentId: payment._id,
      bookingId: payment.bookingId || null,
      userId: payment.userId,
      actorId: user.userId,
      actorRole: "admin",
      amount: refundAmount,
      note: data.note || "",
      source: "admin_api",
      metadata: {
        paymentProvider: payment.provider,
        providerPaymentId: payment.providerPaymentId || "",
      },
    });

    await writeAuditLog({
      actorId: user.userId,
      actorRole: user.role,
      action: "payment.refund",
      targetType: "payment",
      targetId: payment._id,
      metadata: { refundAmount, note: data.note },
      req,
    });

    const res = NextResponse.json({ ok: true, payment, refundAmount });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    await logError("api.refunds.create", error, { actorId: user?.userId || "" });
    return NextResponse.json({ ok: false, error: error.message || "Refund failed" }, { status: error.status || 400 });
  }
}

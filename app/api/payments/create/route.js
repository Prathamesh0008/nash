import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { paymentCreateSchema, parseOrThrow } from "@/lib/validators";
import { createPaymentOrder } from "@/lib/paymentService";

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  let idempotencyKey = "";

  try {
    const data = parseOrThrow(paymentCreateSchema, await req.json());
    idempotencyKey = (req.headers.get("x-idempotency-key") || "").trim().slice(0, 128);

    if (idempotencyKey) {
      const existing = await Payment.findOne({
        userId: user.userId,
        idempotencyKey,
      }).lean();
      if (existing) {
        const res = NextResponse.json({ ok: true, payment: existing, idempotent: true });
        return applyRefreshCookies(res, refreshedResponse);
      }
    }

    const order = await createPaymentOrder({
      amount: data.amount,
      currency: "INR",
      receipt: `${data.type}_${Date.now()}`,
      notes: {
        bookingId: data.bookingId || "",
        workerId: data.workerId || "",
      },
    });

    const payment = await Payment.create({
      userId: user.userId,
      bookingId: data.bookingId || null,
      workerId: data.workerId || null,
      type: data.type,
      amount: data.amount,
      status: "created",
      provider: order.provider,
      providerOrderId: order.providerOrderId,
      idempotencyKey: idempotencyKey || undefined,
      metadata: { ...(data.metadata || {}), order: order.raw || {} },
    });

    const res = NextResponse.json({
      ok: true,
      payment,
      paymentOrder: {
        provider: order.provider,
        orderId: order.providerOrderId,
        amount: order.amount,
        currency: order.currency,
        keyId: order.provider === "razorpay" ? process.env.RAZORPAY_KEY_ID || "" : "",
      },
    });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    if (error?.code === 11000) {
      if (idempotencyKey) {
        const existing = await Payment.findOne({ userId: user.userId, idempotencyKey }).lean();
        if (existing) {
          const res = NextResponse.json({ ok: true, payment: existing, idempotent: true });
          return applyRefreshCookies(res, refreshedResponse);
        }
      }
      return NextResponse.json({ ok: false, error: "Duplicate payment request" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: error.message || "Failed to create payment" }, { status: error.status || 400 });
  }
}

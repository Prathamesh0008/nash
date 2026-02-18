import crypto from "crypto";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import PaymentWebhookEvent from "@/models/PaymentWebhookEvent";
import RefundAudit from "@/models/RefundAudit";
import { createNotification } from "@/lib/notify";

function verifyRazorpayWebhook(body, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

async function markPaymentPaid({ providerOrderId = "", providerPaymentId = "" }) {
  const conditions = [
    ...(providerOrderId ? [{ providerOrderId }] : []),
    ...(providerPaymentId ? [{ providerPaymentId }] : []),
  ];
  if (conditions.length === 0) return null;

  const payment = await Payment.findOne({ $or: conditions });

  if (!payment) return null;

  payment.status = "paid";
  if (providerOrderId) payment.providerOrderId = providerOrderId;
  if (providerPaymentId) payment.providerPaymentId = providerPaymentId;
  payment.verifiedAt = payment.verifiedAt || new Date();
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
    actorId: null,
    type: "status",
    title: "Payment received",
    body: `Your payment of INR ${payment.amount} is confirmed.`,
    href: payment.bookingId ? `/orders/${payment.bookingId}` : "/wallet",
    meta: { paymentId: payment._id.toString(), status: "paid" },
  });

  return payment;
}

async function markPaymentFailed({ providerOrderId = "", providerPaymentId = "" }) {
  const conditions = [
    ...(providerOrderId ? [{ providerOrderId }] : []),
    ...(providerPaymentId ? [{ providerPaymentId }] : []),
  ];
  if (conditions.length === 0) return null;

  const payment = await Payment.findOne({ $or: conditions });

  if (!payment) return null;

  payment.status = "failed";
  if (providerOrderId) payment.providerOrderId = providerOrderId;
  if (providerPaymentId) payment.providerPaymentId = providerPaymentId;
  await payment.save();

  return payment;
}

async function markPaymentRefunded({ providerPaymentId = "" }) {
  if (!providerPaymentId) return null;

  const payment = await Payment.findOne({ providerPaymentId });
  if (!payment) return null;

  payment.status = "refunded";
  payment.refundedAt = payment.refundedAt || new Date();
  await payment.save();

  if (payment.bookingId) {
    await Booking.updateOne({ _id: payment.bookingId }, { $set: { paymentStatus: "refunded" } });
  }

  await RefundAudit.create({
    paymentId: payment._id,
    bookingId: payment.bookingId || null,
    userId: payment.userId,
    actorId: null,
    actorRole: "system",
    amount: Number(payment.amount || 0),
    note: "Provider webhook refund",
    source: "provider_webhook",
    metadata: {
      provider: payment.provider,
      providerPaymentId,
    },
  });

  return payment;
}

function getPayloadHash(rawBody) {
  return crypto.createHash("sha256").update(rawBody).digest("hex");
}

function buildEventKey(payload, rawBody, signature) {
  const payloadEventId = payload?.payload?.payment?.entity?.id || payload?.payload?.refund?.entity?.id || "";
  const eventType = payload?.event || "unknown";
  if (payloadEventId) return `razorpay:${eventType}:${payloadEventId}`;
  return `razorpay:${eventType}:${getPayloadHash(`${rawBody}:${signature || ""}`)}`;
}

export async function POST(req) {
  if ((process.env.PAYMENT_PROVIDER || "demo").toLowerCase() !== "razorpay") {
    return NextResponse.json({ ok: true, ignored: true, reason: "Webhook only active for razorpay provider" });
  }

  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  if (!verifyRazorpayWebhook(body, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  await dbConnect();
  const eventKey = buildEventKey(payload, body, signature);
  const payloadHash = getPayloadHash(body);
  try {
    await PaymentWebhookEvent.create({
      eventKey,
      provider: "razorpay",
      eventType: payload?.event || "",
      payloadHash,
      processedAt: new Date(),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ ok: true, handled: "duplicate", event: payload?.event || "" });
    }
    return NextResponse.json({ ok: false, error: "Failed to persist webhook event" }, { status: 500 });
  }

  const event = payload?.event || "";
  const paymentEntity = payload?.payload?.payment?.entity || {};
  const refundEntity = payload?.payload?.refund?.entity || {};

  const providerOrderId = paymentEntity?.order_id || "";
  const providerPaymentId = paymentEntity?.id || refundEntity?.payment_id || "";

  if (event === "payment.captured" || event === "order.paid") {
    const payment = await markPaymentPaid({ providerOrderId, providerPaymentId });
    return NextResponse.json({ ok: true, handled: event, paymentId: payment?._id || null });
  }

  if (event === "payment.failed") {
    const payment = await markPaymentFailed({ providerOrderId, providerPaymentId });
    return NextResponse.json({ ok: true, handled: event, paymentId: payment?._id || null });
  }

  if (event === "refund.created" || event === "refund.processed") {
    const payment = await markPaymentRefunded({ providerPaymentId });
    return NextResponse.json({ ok: true, handled: event, paymentId: payment?._id || null });
  }

  return NextResponse.json({ ok: true, handled: "ignored", event });
}

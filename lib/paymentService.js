import crypto from "crypto";

const DEMO_PREFIXES = ["pay_", "tok_", "demo_"];

function isDemoToken(token) {
  return DEMO_PREFIXES.some((prefix) => token.startsWith(prefix));
}

export function getPaymentProvider() {
  return (process.env.PAYMENT_PROVIDER || "demo").toLowerCase();
}

async function createRazorpayOrder({ amount, currency, receipt, notes }) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
  }

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: Math.round(Number(amount) * 100),
      currency: currency || "INR",
      receipt,
      notes: notes || {},
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    const reason = json?.error?.description || json?.error?.reason || "Failed to create Razorpay order";
    throw new Error(reason);
  }

  return {
    providerOrderId: json.id,
    amount: json.amount / 100,
    currency: json.currency,
    raw: json,
  };
}

export async function createPaymentOrder({ amount, currency = "INR", receipt = "", notes = {} }) {
  const provider = getPaymentProvider();

  if (provider === "razorpay") {
    const order = await createRazorpayOrder({ amount, currency, receipt, notes });
    return { provider, ...order };
  }

  return {
    provider: "demo",
    providerOrderId: `demo_order_${Date.now()}`,
    amount,
    currency,
    raw: { demo: true },
  };
}

function verifyRazorpaySignature({ providerOrderId, providerPaymentId, providerSignature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  if (!providerOrderId || !providerPaymentId || !providerSignature) return false;

  const payload = `${providerOrderId}|${providerPaymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return expected === providerSignature;
}

export async function verifyPayment({
  paymentToken = "",
  providerOrderId = "",
  providerPaymentId = "",
  providerSignature = "",
  provider = getPaymentProvider(),
}) {
  if (provider === "razorpay") {
    const ok = verifyRazorpaySignature({ providerOrderId, providerPaymentId, providerSignature });
    return { ok, providerPaymentId: providerPaymentId || "", providerOrderId: providerOrderId || "" };
  }

  const token = String(paymentToken || providerPaymentId || "").trim();
  const ok = token.length >= 6 && isDemoToken(token);
  return {
    ok,
    providerPaymentId: token || `demo_pay_${Date.now()}`,
    providerOrderId: providerOrderId || `demo_order_${Date.now()}`,
  };
}

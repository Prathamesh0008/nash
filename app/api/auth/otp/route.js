import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { createOtp, normalizeOtpContact, verifyOtp } from "@/lib/otpService";
import { enforceRateLimit, getRateLimitKey } from "@/lib/rateLimit";

export async function POST(req) {
  const rl = enforceRateLimit({
    key: getRateLimitKey(req, "otp"),
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "Too many OTP requests" }, { status: 429 });
  }

  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const action = body.action || "request";
  const normalized = normalizeOtpContact({ phone: body.phone, email: body.email });

  if (!normalized) {
    return NextResponse.json({ ok: false, error: "Phone or email is required" }, { status: 400 });
  }

  if (action === "verify") {
    const code = String(body.code || "").trim();
    if (!code) {
      return NextResponse.json({ ok: false, error: "OTP code required" }, { status: 400 });
    }
    const result = await verifyOtp({
      contact: normalized.contact,
      channel: normalized.channel,
      code,
      purpose: body.purpose || "auth",
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, verifiedAt: result.verifiedAt });
  }

  const otp = await createOtp({
    contact: normalized.contact,
    channel: normalized.channel,
    purpose: body.purpose || "auth",
  });

  const isDemoProvider = !process.env.OTP_PROVIDER || process.env.OTP_PROVIDER === "demo";
  return NextResponse.json({
    ok: true,
    message: isDemoProvider ? "OTP generated (demo mode)" : "OTP sent",
    target: normalized.contact,
    channel: normalized.channel,
    expiresAt: otp.expiresAt,
    ...(isDemoProvider ? { otp: otp.code } : {}),
  });
}

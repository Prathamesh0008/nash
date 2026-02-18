import crypto from "crypto";
import OtpCode from "@/models/OtpCode";

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);

function hashCode(contact, code) {
  return crypto.createHash("sha256").update(`${contact}:${code}`).digest("hex");
}

export function normalizeOtpContact({ phone, email }) {
  const normalizedPhone = typeof phone === "string" ? phone.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (normalizedPhone) return { channel: "phone", contact: normalizedPhone };
  if (normalizedEmail) return { channel: "email", contact: normalizedEmail };
  return null;
}

export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createOtp({ contact, channel, purpose = "auth" }) {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await OtpCode.deleteMany({ contact, channel, purpose });
  await OtpCode.create({
    contact,
    channel,
    purpose,
    codeHash: hashCode(contact, code),
    expiresAt,
  });

  return { code, expiresAt };
}

export async function verifyOtp({ contact, code, channel, purpose = "auth" }) {
  const now = new Date();
  const doc = await OtpCode.findOne({
    contact,
    channel,
    purpose,
    verifiedAt: null,
    expiresAt: { $gt: now },
  }).sort({ createdAt: -1 });

  if (!doc) {
    return { ok: false, error: "OTP expired or not found" };
  }

  if (doc.attempts >= 5) {
    return { ok: false, error: "Too many invalid attempts" };
  }

  const expectedHash = hashCode(contact, code);
  if (expectedHash !== doc.codeHash) {
    doc.attempts += 1;
    await doc.save();
    return { ok: false, error: "Invalid OTP" };
  }

  doc.verifiedAt = new Date();
  await doc.save();

  return { ok: true, verifiedAt: doc.verifiedAt };
}
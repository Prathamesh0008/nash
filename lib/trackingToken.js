import crypto from "crypto";

const TOKEN_VERSION = 1;
const DEFAULT_TTL_SECONDS = 60 * 90;

function getSecret() {
  const secret = process.env.TRACKING_TOKEN_SECRET;
  if (!secret) {
    throw new Error("Missing TRACKING_TOKEN_SECRET in environment");
  }
  return secret;
}

function encodePayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(encoded) {
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function signEncodedPayload(encoded) {
  return crypto.createHmac("sha256", getSecret()).update(encoded).digest("base64url");
}

function safeEqualText(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function signTrackingToken({ bookingId, userId, role }, options = {}) {
  const ttlSeconds = Number(options.ttlSeconds) > 0 ? Number(options.ttlSeconds) : DEFAULT_TTL_SECONDS;
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    v: TOKEN_VERSION,
    bid: String(bookingId || ""),
    uid: String(userId || ""),
    role: String(role || ""),
    exp: now + ttlSeconds,
  };

  const encoded = encodePayload(payload);
  const signature = signEncodedPayload(encoded);
  return `${encoded}.${signature}`;
}

export function verifyTrackingToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const encoded = parts[0];
  const signature = parts[1];
  const expected = signEncodedPayload(encoded);
  if (!safeEqualText(signature, expected)) return null;

  const payload = decodePayload(encoded);
  if (!payload) return null;

  const now = Math.floor(Date.now() / 1000);
  if (Number(payload.exp || 0) < now) return null;
  if (!payload.bid || !payload.uid || !payload.role) return null;

  return {
    bookingId: String(payload.bid),
    userId: String(payload.uid),
    role: String(payload.role),
    exp: Number(payload.exp),
    version: Number(payload.v || 0),
  };
}

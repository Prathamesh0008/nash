import dbConnect from "@/lib/dbConnect";
import RateLimitBucket from "@/models/RateLimitBucket";

const memoryStore = new Map();
const rateLimitStore = String(process.env.RATE_LIMIT_STORE || "memory").trim().toLowerCase();
const useMongoStore = rateLimitStore === "mongo";

function normalizeLimit(limit) {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return Math.floor(parsed);
}

function normalizeWindowMs(windowMs) {
  const parsed = Number(windowMs);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1000;
  return Math.floor(parsed);
}

function enforceRateLimitMemory({ key, limit, windowMs }) {
  if (!key) return { ok: true, remaining: limit };

  const now = Date.now();
  const bucket = memoryStore.get(key);

  if (!bucket || now > bucket.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

async function enforceRateLimitMongo({ key, limit, windowMs }) {
  if (!key) return { ok: true, remaining: limit };

  const now = Date.now();
  const nextResetAt = now + windowMs;

  await dbConnect();

  const bucket = await RateLimitBucket.findOneAndUpdate(
    { _id: key },
    [
      {
        $set: {
          resetAt: {
            $cond: [
              { $or: [{ $not: ["$resetAt"] }, { $lte: ["$resetAt", now] }] },
              nextResetAt,
              "$resetAt",
            ],
          },
          count: {
            $cond: [
              { $or: [{ $not: ["$resetAt"] }, { $lte: ["$resetAt", now] }] },
              1,
              { $add: [{ $ifNull: ["$count", 0] }, 1] },
            ],
          },
        },
      },
      {
        $set: {
          expiresAt: { $toDate: "$resetAt" },
        },
      },
    ],
    { upsert: true, new: true, lean: true }
  );

  const count = Number(bucket?.count || 0);
  const resetAt = Number(bucket?.resetAt || nextResetAt);
  if (count > limit) {
    return { ok: false, retryAfterMs: Math.max(1, resetAt - now) };
  }
  return { ok: true, remaining: Math.max(0, limit - count) };
}

export async function enforceRateLimit({ key, limit, windowMs }) {
  const safeLimit = normalizeLimit(limit);
  const safeWindowMs = normalizeWindowMs(windowMs);

  if (!useMongoStore) {
    return enforceRateLimitMemory({ key, limit: safeLimit, windowMs: safeWindowMs });
  }

  try {
    return await enforceRateLimitMongo({ key, limit: safeLimit, windowMs: safeWindowMs });
  } catch {
    return enforceRateLimitMemory({ key, limit: safeLimit, windowMs: safeWindowMs });
  }
}

export function getRateLimitKey(req, scope) {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim() || "local";
  return `${scope}:${ip}`;
}

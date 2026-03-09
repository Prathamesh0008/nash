import AuditLog from "@/models/AuditLog";
import crypto from "crypto";

export async function writeAuditLog({ actorId, actorRole, action, targetType = "", targetId = null, metadata = {}, req = null }) {
  if (!actorId || !actorRole || !action) return null;
  const ip = req?.headers?.get?.("x-forwarded-for")?.split(",")?.[0]?.trim?.() || "";
  const userAgent = req?.headers?.get?.("user-agent") || "";
  const eventAt = new Date();
  const previous = await AuditLog.findOne({ entryHash: { $exists: true, $ne: null } })
    .sort({ createdAt: -1, _id: -1 })
    .select("entryHash")
    .lean();
  const prevHash = String(previous?.entryHash || "");
  const payload = JSON.stringify({
    actorId: String(actorId),
    actorRole,
    action,
    targetType,
    targetId: targetId ? String(targetId) : "",
    metadata,
    ip,
    userAgent,
    eventAt: eventAt.toISOString(),
  });
  const entryHash = crypto.createHash("sha256").update(`${prevHash}|${payload}`).digest("hex");

  return AuditLog.create({
    actorId,
    actorRole,
    action,
    targetType,
    targetId,
    metadata,
    ip,
    userAgent,
    eventAt,
    prevHash,
    entryHash,
    immutable: true,
  });
}

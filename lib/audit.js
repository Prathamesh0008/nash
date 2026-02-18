import AuditLog from "@/models/AuditLog";

export async function writeAuditLog({ actorId, actorRole, action, targetType = "", targetId = null, metadata = {}, req = null }) {
  if (!actorId || !actorRole || !action) return null;
  const ip = req?.headers?.get?.("x-forwarded-for")?.split(",")?.[0]?.trim?.() || "";
  const userAgent = req?.headers?.get?.("user-agent") || "";

  return AuditLog.create({
    actorId,
    actorRole,
    action,
    targetType,
    targetId,
    metadata,
    ip,
    userAgent,
  });
}
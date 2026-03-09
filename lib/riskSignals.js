import FraudSignal from "@/models/FraudSignal";
import { notifyAdmins } from "@/lib/notify";
import { writeAuditLog } from "@/lib/audit";

const SEVERITY_RANK = { low: 1, medium: 2, high: 3, critical: 4 };
const AUDIT_ROLES = new Set(["admin", "worker", "user", "system"]);

function toSeverity(value = "medium") {
  const normalized = String(value || "").trim().toLowerCase();
  return ["low", "medium", "high", "critical"].includes(normalized) ? normalized : "medium";
}

function shouldNotifySeverity(severity, threshold = "high") {
  return (SEVERITY_RANK[toSeverity(severity)] || 0) >= (SEVERITY_RANK[toSeverity(threshold)] || 0);
}

export async function createRiskSignal({
  userId,
  bookingId = null,
  paymentId = null,
  signalType = "policy_alert",
  severity = "medium",
  reasons = [],
  meta = {},
  status = "open",
  actorId = null,
  actorRole = "system",
  req = null,
  notifyThreshold = "high",
} = {}) {
  if (!userId) return null;

  const safeSeverity = toSeverity(severity);
  const signal = await FraudSignal.create({
    userId,
    bookingId,
    paymentId,
    signalType,
    severity: safeSeverity,
    reasons: Array.isArray(reasons) ? [...new Set(reasons.filter(Boolean))] : [],
    meta: meta && typeof meta === "object" ? meta : {},
    status: ["open", "reviewing", "resolved", "ignored"].includes(status) ? status : "open",
  });

  if (shouldNotifySeverity(safeSeverity, notifyThreshold)) {
    await notifyAdmins({
      actorId: actorId || userId,
      type: "status",
      title: "Suspicious pattern alert",
      body: `${signalType} | ${safeSeverity.toUpperCase()} | ${(signal.reasons || []).join(", ") || "No reason code"}`,
      href: "/admin/fraud",
      meta: {
        signalId: signal._id.toString(),
        signalType,
        severity: safeSeverity,
      },
    });
  }

  const safeActorRole = AUDIT_ROLES.has(actorRole) ? actorRole : "system";
  const auditActorId = actorId || userId;
  if (auditActorId) {
    await writeAuditLog({
      actorId: auditActorId,
      actorRole: safeActorRole,
      action: `risk.signal.${signalType}`,
      targetType: "fraud_signal",
      targetId: signal._id,
      metadata: {
        severity: safeSeverity,
        reasons: signal.reasons || [],
      },
      req,
    });
  }

  return signal;
}

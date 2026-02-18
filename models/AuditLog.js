import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorRole: { type: String, enum: ["admin", "worker", "user", "system"], required: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, default: "" },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    metadata: { type: Object, default: {} },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
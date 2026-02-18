import mongoose from "mongoose";

const CrmMessageLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    channel: { type: String, enum: ["email", "sms", "whatsapp"], required: true, index: true },
    templateKey: { type: String, required: true, index: true },
    recipient: { type: String, default: "" },
    subject: { type: String, default: "" },
    body: { type: String, default: "" },
    status: { type: String, enum: ["queued", "sent", "failed"], default: "queued", index: true },
    provider: { type: String, default: "console" },
    providerMessageId: { type: String, default: "" },
    response: { type: Object, default: {} },
    error: { type: String, default: "" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

CrmMessageLogSchema.index({ createdAt: -1, channel: 1 });

export default mongoose.models.CrmMessageLog || mongoose.model("CrmMessageLog", CrmMessageLogSchema);

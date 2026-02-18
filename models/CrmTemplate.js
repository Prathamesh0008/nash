import mongoose from "mongoose";

const CrmTemplateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, index: true },
    channel: { type: String, enum: ["email", "sms", "whatsapp"], required: true, index: true },
    title: { type: String, default: "" },
    subject: { type: String, default: "" },
    body: { type: String, required: true },
    active: { type: Boolean, default: true, index: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

CrmTemplateSchema.index({ key: 1, channel: 1 }, { unique: true });

export default mongoose.models.CrmTemplate || mongoose.model("CrmTemplate", CrmTemplateSchema);

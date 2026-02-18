import mongoose from "mongoose";

const OtpCodeSchema = new mongoose.Schema(
  {
    contact: { type: String, required: true, index: true },
    channel: { type: String, enum: ["phone", "email"], required: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    verifiedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
    purpose: { type: String, default: "auth" },
  },
  { timestamps: true }
);

OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OtpCode || mongoose.model("OtpCode", OtpCodeSchema);

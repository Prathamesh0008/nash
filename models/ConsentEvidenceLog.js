import mongoose from "mongoose";

const ConsentEvidenceLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userRole: { type: String, enum: ["user", "worker", "admin", "system"], required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
    evidenceType: {
      type: String,
      enum: ["age_attestation", "consent_attestation", "policy_ack", "kyc_age_check"],
      required: true,
      index: true,
    },
    accepted: { type: Boolean, default: true, index: true },
    statement: { type: String, default: "" },
    source: {
      type: String,
      enum: ["booking_checkout", "explicit_form", "onboarding_kyc", "system"],
      default: "system",
      index: true,
    },
    evidenceFiles: { type: [String], default: [] },
    geoSnapshot: {
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    metadata: { type: Object, default: {} },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

ConsentEvidenceLogSchema.index({ userId: 1, evidenceType: 1, createdAt: -1 });
ConsentEvidenceLogSchema.index({ bookingId: 1, createdAt: -1 });

export default mongoose.models.ConsentEvidenceLog ||
  mongoose.model("ConsentEvidenceLog", ConsentEvidenceLogSchema);

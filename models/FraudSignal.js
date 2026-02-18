import mongoose from "mongoose";

const FraudSignalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null, index: true },
    signalType: { type: String, default: "booking_risk", index: true },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium", index: true },
    reasons: { type: [String], default: [] },
    meta: { type: Object, default: {} },
    status: { type: String, enum: ["open", "reviewing", "resolved", "ignored"], default: "open", index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

FraudSignalSchema.index({ createdAt: -1, severity: 1 });

export default mongoose.models.FraudSignal || mongoose.model("FraudSignal", FraudSignalSchema);

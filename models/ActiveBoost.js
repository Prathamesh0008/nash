import mongoose from "mongoose";

const ActiveBoostSchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "BoostPlan", required: true },
    area: { type: String, default: "" },
    category: { type: String, default: "" },
    boostScore: { type: Number, required: true, min: 0 },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    status: { type: String, enum: ["active", "expired"], default: "active", index: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
  },
  { timestamps: true }
);

ActiveBoostSchema.index({ area: 1, category: 1, status: 1, endAt: 1 });

export default mongoose.models.ActiveBoost || mongoose.model("ActiveBoost", ActiveBoostSchema);
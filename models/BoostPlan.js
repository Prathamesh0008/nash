import mongoose from "mongoose";

const BoostPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true, min: 1 },
    boostScore: { type: Number, required: true, min: 0 },
    areaLimited: { type: Boolean, default: true },
    categoryLimited: { type: Boolean, default: true },
    slotLimit: { type: Number, default: 10, min: 1 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.BoostPlan || mongoose.model("BoostPlan", BoostPlanSchema);
import mongoose from "mongoose";

const TierSchema = new mongoose.Schema(
  {
    minHoursBefore: { type: Number, required: true },
    maxHoursBefore: { type: Number, required: true },
    fee: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ReschedulePolicySchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default Policy" },
    tiers: {
      type: [TierSchema],
      default: [
        { minHoursBefore: 24, maxHoursBefore: 9999, fee: 0 },
        { minHoursBefore: 6, maxHoursBefore: 24, fee: 99 },
        { minHoursBefore: 0, maxHoursBefore: 6, fee: 199 },
      ],
    },
    blockStatuses: {
      type: [String],
      default: ["working"],
    },
    highFeeStatuses: {
      type: [String],
      default: ["onway"],
    },
    highFeeAmount: { type: Number, default: 299 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.ReschedulePolicy ||
  mongoose.model("ReschedulePolicy", ReschedulePolicySchema);
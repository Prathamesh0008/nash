import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema(
  {
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refereeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    referralCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
    status: {
      type: String,
      enum: ["signed_up", "discount_applied", "reward_credited", "cancelled"],
      default: "signed_up",
      index: true,
    },
    referralDiscount: { type: Number, default: 0, min: 0 },
    rewardAmount: { type: Number, default: 0, min: 0 },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

ReferralSchema.index({ referrerId: 1, refereeId: 1 }, { unique: true });

export default mongoose.models.Referral || mongoose.model("Referral", ReferralSchema);

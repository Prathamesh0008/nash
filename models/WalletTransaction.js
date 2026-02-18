import mongoose from "mongoose";

const WalletTransactionSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ownerType: { type: String, enum: ["user", "worker", "admin"], required: true },
    direction: { type: String, enum: ["credit", "debit"], required: true },
    reason: {
      type: String,
      enum: [
        "booking_payment",
        "reschedule_fee",
        "boost_purchase",
        "membership_purchase",
        "verification_fee",
        "refund",
        "payout",
        "referral_reward",
        "manual_adjustment",
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true },
    referenceType: { type: String, default: "" },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

WalletTransactionSchema.index({ ownerId: 1, createdAt: -1 });

export default mongoose.models.WalletTransaction ||
  mongoose.model("WalletTransaction", WalletTransactionSchema);

import mongoose from "mongoose";

const PayoutSchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["requested", "approved", "paid", "rejected"], default: "requested", index: true },
    bankRef: { type: String, default: "" },
    note: { type: String, default: "" },
    walletRefunded: { type: Boolean, default: false },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date, default: null },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Payout || mongoose.model("Payout", PayoutSchema);

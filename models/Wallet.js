import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);
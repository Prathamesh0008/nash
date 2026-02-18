import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    type: {
      type: String,
      enum: ["booking", "reschedule", "boost", "membership", "verification", "refund", "payout", "wallet"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    provider: { type: String, default: "demo" },
    status: { type: String, enum: ["created", "paid", "failed", "refunded"], default: "created", index: true },
    providerOrderId: { type: String, default: "" },
    providerPaymentId: { type: String, default: "" },
    idempotencyKey: { type: String, default: "", index: true },
    metadata: { type: Object, default: {} },
    verifiedAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

PaymentSchema.index({ provider: 1, providerPaymentId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

import mongoose from "mongoose";

const PaymentWebhookEventSchema = new mongoose.Schema(
  {
    eventKey: { type: String, required: true, unique: true, index: true },
    provider: { type: String, default: "razorpay", index: true },
    eventType: { type: String, default: "" },
    payloadHash: { type: String, default: "" },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.PaymentWebhookEvent || mongoose.model("PaymentWebhookEvent", PaymentWebhookEventSchema);

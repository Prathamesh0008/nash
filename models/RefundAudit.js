import mongoose from "mongoose";

const RefundAuditSchema = new mongoose.Schema(
  {
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    actorRole: { type: String, enum: ["admin", "system"], default: "system" },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, default: "" },
    source: { type: String, enum: ["admin_api", "provider_webhook"], default: "admin_api" },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.RefundAudit || mongoose.model("RefundAudit", RefundAuditSchema);

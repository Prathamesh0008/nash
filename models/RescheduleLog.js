import mongoose from "mongoose";

const RescheduleLogSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    oldSlot: { type: Date, required: true },
    newSlot: { type: Date, required: true },
    fee: { type: Number, required: true, min: 0 },
    paidVia: { type: String, enum: ["wallet", "online", "waived"], default: "online" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.RescheduleLog ||
  mongoose.model("RescheduleLog", RescheduleLogSchema);
import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ConversationSchema.index({ userId: 1, updatedAt: -1 });
ConversationSchema.index({ workerUserId: 1, updatedAt: -1 });
ConversationSchema.index({ bookingId: 1 }, { sparse: true });
ConversationSchema.index({ userId: 1, workerUserId: 1, bookingId: 1 }, { unique: true });

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);

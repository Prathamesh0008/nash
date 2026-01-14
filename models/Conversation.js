import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true } // ✅ provides updatedAt
);

export default mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);

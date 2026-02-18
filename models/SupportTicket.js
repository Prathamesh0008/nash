import mongoose from "mongoose";

const TicketReplySchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actorRole: { type: String, enum: ["user", "worker", "admin"], required: true },
    message: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SupportTicketSchema = new mongoose.Schema(
  {
    ticketNo: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userRole: { type: String, enum: ["user", "worker"], required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["booking", "payment", "payout", "account", "technical", "other"],
      default: "other",
      index: true,
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    message: { type: String, required: true, trim: true },
    attachments: { type: [String], default: [] },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open", index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lastReplyAt: { type: Date, default: Date.now, index: true },
    replies: { type: [TicketReplySchema], default: [] },
  },
  { timestamps: true }
);

SupportTicketSchema.index({ userId: 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);

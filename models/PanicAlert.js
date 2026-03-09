import mongoose from "mongoose";

const PanicTimelineSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    actorRole: { type: String, enum: ["user", "worker", "admin", "system"], default: "system" },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
    metadata: { type: Object, default: {} },
  },
  { _id: false }
);

const PanicAlertSchema = new mongoose.Schema(
  {
    alertNo: { type: String, required: true, unique: true, index: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    raisedByRole: { type: String, enum: ["user", "worker", "admin"], required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", default: null, index: true },
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "SupportTicket", default: null, index: true },
    message: { type: String, required: true, trim: true },
    severity: { type: String, enum: ["high", "critical"], default: "critical", index: true },
    status: {
      type: String,
      enum: ["open", "acknowledged", "in_progress", "resolved", "escalated", "false_alarm"],
      default: "open",
      index: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    location: {
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    attachments: { type: [String], default: [] },
    triggerSource: { type: String, default: "panic_button" },
    slaFirstResponseDueAt: { type: Date, default: null, index: true },
    firstResponseAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    timeline: { type: [PanicTimelineSchema], default: [] },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

PanicAlertSchema.index({ status: 1, createdAt: -1 });
PanicAlertSchema.index({ raisedBy: 1, createdAt: -1 });

export default mongoose.models.PanicAlert || mongoose.model("PanicAlert", PanicAlertSchema);

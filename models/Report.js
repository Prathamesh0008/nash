import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reporterType: {
      type: String,
      enum: ["user", "worker"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["worker", "user"],
      required: true,
    },
    category: {
      type: String,
      enum: ["misbehavior", "no-show", "fraud", "payment", "safety", "other"],
      required: true,
    },
    message: { type: String, required: true },
    evidence: { type: [String], default: [] },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "closed"],
      default: "open",
      index: true,
    },
    slaDueAt: { type: Date, default: null, index: true },
    firstResponseAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    disputeStatus: {
      type: String,
      enum: ["none", "raised", "reviewing", "closed"],
      default: "none",
      index: true,
    },
    disputeMessage: { type: String, default: "" },
    disputeRaisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    disputeRaisedAt: { type: Date, default: null },
    disputeResolvedAt: { type: Date, default: null },
    disputeResolutionNote: { type: String, default: "" },
    adminNotes: { type: String, default: "" },
    adminAction: {
      type: String,
      enum: ["warning", "tempBan", "permaBan", "noAction", ""],
      default: "",
    },
    falseReportMarked: { type: Boolean, default: false },
    penaltyApplied: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReportSchema.index({ reporterId: 1, bookingId: 1 }, { unique: true });

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);

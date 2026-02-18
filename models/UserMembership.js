import mongoose from "mongoose";

const PlanSnapshotSchema = new mongoose.Schema(
  {
    code: { type: String, default: "" },
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    durationDays: { type: Number, default: 0 },
    discountType: { type: String, enum: ["flat", "percent"], default: "percent" },
    discountValue: { type: Number, default: 0 },
    maxDiscountPerBooking: { type: Number, default: 0 },
    maxTotalDiscount: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserMembershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "MembershipPlan", required: true, index: true },
    planSnapshot: { type: PlanSnapshotSchema, required: true },
    status: { type: String, enum: ["active", "expired", "cancelled"], default: "active", index: true },
    startedAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true, index: true },
    purchasedAt: { type: Date, default: Date.now },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
    paymentMethod: { type: String, enum: ["online", "wallet"], default: "online" },
    amountPaid: { type: Number, default: 0, min: 0 },
    discountUsed: { type: Number, default: 0, min: 0 },
    usageCount: { type: Number, default: 0, min: 0 },
    bookingIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  },
  { timestamps: true }
);

UserMembershipSchema.index({ userId: 1, status: 1, endsAt: -1 });
UserMembershipSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.UserMembership || mongoose.model("UserMembership", UserMembershipSchema);

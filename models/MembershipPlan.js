import mongoose from "mongoose";

const MembershipPlanSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true, min: 1 },
    discountType: { type: String, enum: ["flat", "percent"], default: "percent" },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountPerBooking: { type: Number, default: 0, min: 0 },
    maxTotalDiscount: { type: Number, default: 0, min: 0 },
    perks: { type: [String], default: [] },
    active: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 100 },
  },
  { timestamps: true }
);

MembershipPlanSchema.index({ active: 1, sortOrder: 1, price: 1 });

export default mongoose.models.MembershipPlan || mongoose.model("MembershipPlan", MembershipPlanSchema);

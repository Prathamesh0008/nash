import mongoose from "mongoose";

const PromoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    discountType: { type: String, enum: ["flat", "percent"], default: "flat" },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxUses: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: 1, min: 1 },
    allowedCategories: { type: [String], default: [] },
    allowedServiceIds: { type: [mongoose.Schema.Types.ObjectId], ref: "Service", default: [] },
    validFrom: { type: Date, default: null, index: true },
    validTill: { type: Date, default: null, index: true },
    active: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

PromoCodeSchema.index({ active: 1, validFrom: 1, validTill: 1 });

export default mongoose.models.PromoCode || mongoose.model("PromoCode", PromoCodeSchema);

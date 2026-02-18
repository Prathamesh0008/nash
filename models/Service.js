import mongoose from "mongoose";

const AddonSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: "" },
    basePrice: { type: Number, required: true, min: 0 },
    visitFee: { type: Number, default: 0, min: 0 },
    taxPercent: { type: Number, default: 18, min: 0 },
    addons: { type: [AddonSchema], default: [] },
    active: { type: Boolean, default: true, index: true },
    heroImage: { type: String, default: "" },
  },
  { timestamps: true }
);

ServiceSchema.index({ active: 1, category: 1 });

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);
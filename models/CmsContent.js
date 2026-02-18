import mongoose from "mongoose";

const CmsContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.CmsContent || mongoose.model("CmsContent", CmsContentSchema);
import mongoose from "mongoose";

const WorkerSchema = new mongoose.Schema(
  {
    // profile
    fullName: { type: String, default: "" },
    title: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    about: { type: String, default: "" },

    // services
    services: { type: [String], default: [] },

    // location
    zip: { type: String, default: "" },
    city: { type: String, default: "" },

    // personal
    gender: { type: String, default: "" },
    sex: { type: String, default: "" },
    birthdate: { type: String, default: "" },
    bodyType: { type: String, default: "" },
    hairColor: { type: String, default: "" },
    heightCm: { type: String, default: "" },
    languages: { type: [String], default: [] },

    // verification (UI now, real later)
    verification: {
      phoneVerified: { type: Boolean, default: false },
      idPhotoUrl: { type: String, default: "" },
      bodyPhotoUrl: { type: String, default: "" },
    },

    // promotion
    promotionPlan: { type: String, default: "standard" }, // standard/premium/exclusive

    // onboarding status
    status: {
      type: String,
      enum: ["draft", "pending_payment", "active"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Worker || mongoose.model("Worker", WorkerSchema);

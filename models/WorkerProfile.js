import mongoose from "mongoose";

const WorkerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    profile: Object,
    services: [String],
    languages: [String],

    availability: {
      workingDays: [String],
      startTime: String,
      endTime: String,
    },

    contactPreferences: {
      call: Boolean,
      whatsapp: Boolean,
      platform: Boolean,
    },

    verification: {
      phoneCountry: String,
      phoneNumber: String,
      phoneVerified: Boolean,
      identityPhoto: String,
      bodyPhoto: String,
    },
    

    advertisement: {
      promoSticker: String,
    },

    promotionPlan: String,
    acceptedTerms: Boolean,
status: {
  type: String,
  enum: ["draft", "pending_payment", "active", "rejected"],
  default: "draft",
},
rejectionReason: {
  type: String,
  default: "",
},

  },
  { timestamps: true }
);

export default mongoose.models.WorkerProfile ||
  mongoose.model("WorkerProfile", WorkerProfileSchema);


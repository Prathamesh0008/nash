import mongoose from "mongoose";

const WorkerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /* ================= BASIC INFO ================= */
    fullName: String,
    phone: String,
    city: String,
    address: String,

    dob: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    nationality: String,

    heightCm: Number,
    weightKg: Number,
    hairColor: String,

    /* ================= PHOTOS ================= */
    profilePhoto: String,
    galleryPhotos: { type: [String], default: [] },

    /* ================= SERVICES ================= */
    services: {
      type: [
        {
          name: String,
          experienceYears: Number,
          basePrice: Number,
        },
      ],
      default: [],
    },

    extraServices: {
      type: [
        {
          title: String,
          price: Number,
        },
      ],
      default: [],
    },

    speciality: String,

    /* ================= AVAILABILITY ================= */
    availability: {
      workingDays: [String],
      timeFrom: String,
      timeTo: String,
      emergencyAvailable: Boolean,
    },

    serviceRadiusKm: Number,

    /* ================= SKILLS ================= */
    skills: { type: [String], default: [] },
    languages: { type: [String], default: [] },

    /* ================= BIO ================= */
    bio: String,

    /* ================= DOCUMENTS ================= */
    documents: {
      idProof: String,
      addressProof: String,
    },

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: ["draft", "pending", "active", "rejected"],
      default: "draft",
    },

    adminNote: String,
  },
  { timestamps: true }
);

export default mongoose.models.WorkerProfile ||
  mongoose.model("WorkerProfile", WorkerProfileSchema);

import mongoose from "mongoose";

const ServiceAreaSchema = new mongoose.Schema(
  {
    city: { type: String, trim: true, required: true },
    pincode: { type: String, trim: true, required: true },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: undefined,
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },
  },
  { _id: false }
);

const KycHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["submitted", "in_review", "approved", "rejected", "reupload_requested", "resubmitted"],
      required: true,
    },
    reason: { type: String, default: "" },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WeeklyAvailabilitySchema = new mongoose.Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true },
    start: { type: String, default: "09:00" },
    end: { type: String, default: "18:00" },
    isOff: { type: Boolean, default: false },
  },
  { _id: false }
);

const WorkerExtraServiceSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const WorkerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    profilePhoto: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
      index: true,
    },
    galleryPhotos: { type: [String], default: [] },
    bio: { type: String, trim: true, default: "" },
    skills: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    serviceAreas: { type: [ServiceAreaSchema], default: [] },
    pricing: {
      basePrice: { type: Number, default: 0, min: 0 },
      extraServices: { type: [WorkerExtraServiceSchema], default: [] },
      currency: { type: String, default: "INR" },
    },
    address: { type: String, trim: true, default: "" },
    docs: {
      idProof: { type: String, default: "" },
      selfie: { type: String, default: "" },
      certificates: { type: [String], default: [] },
    },

    accountStatus: {
      type: String,
      enum: ["REGISTERED", "ONBOARDED", "LIVE"],
      default: "REGISTERED",
    },
    verificationStatus: {
      type: String,
      enum: ["INCOMPLETE", "PENDING_REVIEW", "APPROVED", "REJECTED"],
      default: "INCOMPLETE",
      index: true,
    },
    verificationFeePaid: { type: Boolean, default: false },
    verificationFeeAmount: { type: Number, default: 0 },
    verificationFeePaidAt: { type: Date, default: null },
    verificationExpiresAt: { type: Date, default: null },
    verificationNote: { type: String, default: "" },
    kyc: {
      queueStatus: {
        type: String,
        enum: ["not_submitted", "pending_review", "in_review", "approved", "rejected", "reupload_required"],
        default: "not_submitted",
        index: true,
      },
      submittedAt: { type: Date, default: null, index: true },
      reviewedAt: { type: Date, default: null },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      rejectionReason: { type: String, default: "" },
      docsVersion: { type: Number, default: 1 },
      reuploadRequestedAt: { type: Date, default: null },
      reviewSlaDueAt: { type: Date, default: null, index: true },
      history: { type: [KycHistorySchema], default: [] },
    },

    ratingAvg: { type: Number, default: 0 },
    jobsCompleted: { type: Number, default: 0 },
    cancelRate: { type: Number, default: 0 },
    responseTimeAvg: { type: Number, default: 0 },

    isOnline: { type: Boolean, default: false, index: true },
    penalties: {
      reportFlags: { type: Number, default: 0 },
      noShows: { type: Number, default: 0 },
      strikes: { type: Number, default: 0 },
    },
    availabilityCalendar: {
      timezone: { type: String, default: "Asia/Kolkata" },
      minNoticeMinutes: { type: Number, default: 30 },
      weekly: {
        type: [WeeklyAvailabilitySchema],
        default: [
          { day: 0, start: "09:00", end: "18:00", isOff: true },
          { day: 1, start: "09:00", end: "18:00", isOff: false },
          { day: 2, start: "09:00", end: "18:00", isOff: false },
          { day: 3, start: "09:00", end: "18:00", isOff: false },
          { day: 4, start: "09:00", end: "18:00", isOff: false },
          { day: 5, start: "09:00", end: "18:00", isOff: false },
          { day: 6, start: "09:00", end: "18:00", isOff: false },
        ],
      },
      blockedSlots: { type: [Date], default: [] },
    },

    payoutWalletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: null },
  },
  { timestamps: true }
);

WorkerProfileSchema.index({ categories: 1, isOnline: 1 });
WorkerProfileSchema.index({ "serviceAreas.pincode": 1, isOnline: 1 });
WorkerProfileSchema.index({ "serviceAreas.location": "2dsphere" }, { sparse: true });
WorkerProfileSchema.index({ verificationStatus: 1, verificationFeePaid: 1 });

export default mongoose.models.WorkerProfile ||
  mongoose.model("WorkerProfile", WorkerProfileSchema);

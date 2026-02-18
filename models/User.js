import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Home" },
    line1: { type: String, trim: true, required: true },
    line2: { type: String, trim: true, default: "" },
    landmark: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, required: true },
    state: { type: String, trim: true, default: "" },
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
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const SavedSearchFilterSchema = new mongoose.Schema(
  {
    filterId: { type: String, required: true, trim: true },
    name: { type: String, trim: true, default: "" },
    q: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const RecentSearchSchema = new mongoose.Schema(
  {
    q: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "worker", "admin"],
      default: "user",
      index: true,
    },
    name: { type: String, trim: true, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
      index: true,
    },
    phone: { type: String, trim: true, default: "" },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
      index: true,
    },
    blockedUntil: { type: Date, default: null, index: true },
    blockReason: { type: String, default: "" },
    addresses: { type: [AddressSchema], default: [] },
    walletBalance: { type: Number, default: 0 },
    reportStats: {
      submittedCount: { type: Number, default: 0 },
      falseCount: { type: Number, default: 0 },
    },
    referralCode: { type: String, trim: true, uppercase: true, unique: true, sparse: true, index: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    referralStats: {
      totalReferrals: { type: Number, default: 0 },
      totalRewards: { type: Number, default: 0 },
    },
    preferences: {
      favoriteWorkerIds: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
      savedSearchFilters: { type: [SavedSearchFilterSchema], default: [] },
      recentSearches: { type: [RecentSearchSchema], default: [] },
    },
    refreshVersion: { type: Number, default: 0 },
    lastSeenAt: { type: Date, default: null },
    notifyEmail: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ phone: 1 }, { sparse: true });
UserSchema.index({ "addresses.location": "2dsphere" }, { sparse: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);

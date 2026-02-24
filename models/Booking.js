import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    landmark: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, default: "" },
    pincode: { type: String, required: true },
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

const PriceBreakupSchema = new mongoose.Schema(
  {
    base: { type: Number, required: true },
    visit: { type: Number, default: 0 },
    addons: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "INR" },
  },
  { _id: false }
);

const StatusLogSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "confirmed", "assigned", "onway", "working", "completed", "cancelled"],
      required: true,
    },
    at: { type: Date, default: Date.now },
    actorRole: { type: String, enum: ["user", "worker", "admin", "system"], default: "system" },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    address: { type: AddressSchema, required: true },
    slotTime: { type: Date, required: true, index: true },
    notes: { type: String, default: "" },
    images: { type: [String], default: [] },
    selectedAddons: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["pending", "confirmed", "assigned", "onway", "working", "completed", "cancelled"],
      default: "confirmed",
      index: true,
    },
    statusLogs: { type: [StatusLogSchema], default: [] },

    assignmentMode: { type: String, enum: ["auto", "manual"], default: "auto" },
    assignmentReason: { type: String, default: "" },
    strictWorker: { type: Boolean, default: false },
    requestedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },

    priceBreakup: { type: PriceBreakupSchema, required: true },

    paymentMethod: { type: String, enum: ["online", "wallet", "cod"], default: "online" },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
      index: true,
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },

    rescheduleCount: { type: Number, default: 0 },
    reportWindowEndsAt: { type: Date, default: null, index: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", default: null },
    idempotencyKey: { type: String, default: undefined, index: true },
    sourceBookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
    isRebook: { type: Boolean, default: false, index: true },
    rebookVersion: { type: Number, default: 0 },
    promoCode: { type: String, default: "", index: true },
    promoDiscount: { type: Number, default: 0 },
    referralCode: { type: String, default: "", index: true },
    referralDiscount: { type: Number, default: 0 },
    membershipPlanCode: { type: String, default: "", index: true },
    membershipDiscount: { type: Number, default: 0 },
    userMembershipId: { type: mongoose.Schema.Types.ObjectId, ref: "UserMembership", default: null, index: true },

    rating: {
      stars: { type: Number, min: 1, max: 5, default: null },
      review: { type: String, default: "" },
    },
    completionProof: {
      beforePhotos: { type: [String], default: [] },
      afterPhotos: { type: [String], default: [] },
      note: { type: String, default: "" },
      submittedAt: { type: Date, default: null },
      submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
  },
  { timestamps: true }
);

BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ workerId: 1, createdAt: -1 });
BookingSchema.index({ status: 1, slotTime: 1 });
BookingSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

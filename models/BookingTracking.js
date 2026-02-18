import mongoose from "mongoose";

const TrackingPointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    accuracy: { type: Number, default: null },
    speed: { type: Number, default: null },
    heading: { type: Number, default: null },
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const BookingTrackingSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    isLive: { type: Boolean, default: false },
    lastLocation: { type: TrackingPointSchema, default: null },
    trail: { type: [TrackingPointSchema], default: [] },
  },
  { timestamps: true }
);

BookingTrackingSchema.index({ workerId: 1, updatedAt: -1 });
BookingTrackingSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.BookingTracking || mongoose.model("BookingTracking", BookingTrackingSchema);


import mongoose from "mongoose";

const WorkerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    phone: { type: String, default: "" },
    city: { type: String, default: "" },
    services: [{ type: String }], // e.g. ["Plumber", "Electrician"]
    availability: { type: String, default: "" }, // e.g. "Mon-Fri 9am-6pm"
    photoUrl: { type: String, default: "" },

    status: {
      type: String,
      enum: ["draft", "pending", "active", "rejected"],
      default: "draft",
    },

    ratingAvg: { type: Number, default: 4.5 },
    ratingCount: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export default mongoose.models.WorkerProfile ||
  mongoose.model("WorkerProfile", WorkerProfileSchema);

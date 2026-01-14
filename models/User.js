import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "worker", "admin"],
      default: "user",
    },
    name: { type: String, default: "" },
    email: { type: String, unique: true, required: true, lowercase: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);

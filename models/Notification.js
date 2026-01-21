// import mongoose from "mongoose";

// const NotificationSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

//     // who triggered it (optional but useful)
//     actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

//     // type of notification
//     type: {
//       type: String,
//       enum: ["message", "review", "review_reply", "status", "system"],
//       required: true,
//     },

//     title: { type: String, required: true },
//     body: { type: String, default: "" },

//     // link target (open chat, open worker profile, etc.)
//     href: { type: String, default: "" },

//     // extra data for UI (conversationId, workerId, reviewId etc.)
//     meta: { type: Object, default: {} },

//     read: { type: Boolean, default: false },
//     readAt: { type: Date, default: null },
//   },
//   { timestamps: true }
// );

// export default mongoose.models.Notification ||
//   mongoose.model("Notification", NotificationSchema);

import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },

    actorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null 
    },

    type: {
      type: String,
      enum: ["message", "review", "review_reply", "status", "system"],
      required: true,
    },

    title: { type: String, required: true },
    body: { type: String, default: "" },

    href: { type: String, default: "" },

    meta: { type: Object, default: {} },

    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add indexes for better performance
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

// Virtual for time ago
NotificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return 'Just now';
});

// Virtual for isRecent
NotificationSchema.virtual('isRecent').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > oneDayAgo;
});

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true }, // null means broadcast to all users
    type: {
      type: String,
      enum: ["contest", "problem", "announcement", "account", "system", "submission"],
      default: "system",
      index: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    isRead: { type: Boolean, default: false, index: true },
    readBy: { type: [String], default: [] }, // for broadcast notifications
    createdBy: { type: String, default: "system" },
    createdAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true, collection: "notifications" }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

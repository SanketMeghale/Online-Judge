import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: String, required: true, index: true },
    reporterEmail: { type: String, default: "" },
    targetType: {
      type: String,
      enum: ["problem", "submission", "user", "contest", "bug", "other"],
      required: true,
      index: true
    },
    targetId: { type: String, required: true },
    targetTitle: { type: String, default: "" },
    reason: { type: String, required: true },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "rejected"],
      default: "open",
      index: true
    },
    adminNotes: { type: String, default: "" },
    resolvedBy: { type: String, default: null },
    resolvedAt: { type: Date, default: null }
  },
  { timestamps: true, collection: "reports" }
);

export const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

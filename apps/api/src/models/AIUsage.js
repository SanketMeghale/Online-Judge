import mongoose from "mongoose";

const aiUsageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // "YYYY-MM-DD"
    requestCount: { type: Number, default: 0 },
    tokenCount: { type: Number, default: 0 }
  },
  { timestamps: true, collection: "ai_usages" }
);

aiUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

export const AIUsage =
  mongoose.models.AIUsage || mongoose.model("AIUsage", aiUsageSchema);

import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    problemIds: { type: [String], default: [] },
    participants: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const Contest = mongoose.models.Contest || mongoose.model("Contest", contestSchema);

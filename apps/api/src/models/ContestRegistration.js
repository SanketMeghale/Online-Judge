import mongoose from "mongoose";

const contestRegistrationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    contestId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    username: { type: String, default: "" },
    name: { type: String, default: "" },
    registeredAt: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },
    solvedCount: { type: Number, default: 0 },
    finishTime: { type: Date },
    problemSubmissions: [
      {
        problemId: String,
        status: String,
        score: Number,
        submittedAt: Date
      }
    ]
  },
  { timestamps: true, collection: "contest_registrations" }
);

// Prevent duplicate registrations at database level
contestRegistrationSchema.index({ contestId: 1, userId: 1 }, { unique: true });

export const ContestRegistration =
  mongoose.models.ContestRegistration ||
  mongoose.model("ContestRegistration", contestRegistrationSchema);

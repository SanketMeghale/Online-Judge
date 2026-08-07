import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    ranking: { type: Number, default: 999 },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 1 },
    badges: { type: [String], default: ["New Challenger"] },
    solvedProblemIds: { type: [String], default: [] },
    attemptedProblemIds: { type: [String], default: [] },
    bookmarkedProblemIds: { type: [String], default: [] },
    stats: {
      totalSubmissions: { type: Number, default: 0 },
      acceptedSubmissions: { type: Number, default: 0 },
      waCount: { type: Number, default: 0 },
      reCount: { type: Number, default: 0 },
      tleCount: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    ranking: { type: Number, default: 999 },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 1 },
    badges: { type: [String], default: ["New Challenger"] },
    solvedProblemIds: { type: [String], default: [] },
    attemptedProblemIds: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);

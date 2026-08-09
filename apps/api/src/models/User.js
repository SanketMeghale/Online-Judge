import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: "" },
    language: { type: String, default: "en-US" },
    timezone: { type: String, default: "UTC-5 (Eastern Time)" },
    preferences: {
      theme: { type: String, default: "dark" },
      accentColor: { type: String, default: "indigo" },
      density: { type: String, default: "comfortable" },
      fontSize: { type: Number, default: 14 },
      tabSize: { type: Number, default: 4 },
      wordWrap: { type: Boolean, default: true },
      lineNumbers: { type: Boolean, default: true },
      autoSave: { type: Boolean, default: true },
      editorTheme: { type: String, default: "judgo-dark" },
      contestReminders: { type: Boolean, default: true },
      submissionResults: { type: Boolean, default: true },
      achievementAlerts: { type: Boolean, default: true },
      dailyStreakReminders: { type: Boolean, default: true },
      aiCoachNotifications: { type: Boolean, default: true },
      publicProfile: { type: Boolean, default: true },
      showSolvedProblems: { type: Boolean, default: true },
      showActivity: { type: Boolean, default: true },
      showContestRanking: { type: Boolean, default: true }
    },
    ranking: { type: Number, default: 999 },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: null },
    activeDates: { type: [String], default: [] },
    badges: { type: [String], default: ["New Challenger"] },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
    suspendedReason: { type: String, default: "" },
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
  { timestamps: true, collection: "users" }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);

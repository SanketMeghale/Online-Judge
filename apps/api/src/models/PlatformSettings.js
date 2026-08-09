import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global_settings", unique: true, index: true },
    platformName: { type: String, default: "Judgo" },
    logoUrl: { type: String, default: "/logo.png" },
    tagline: { type: String, default: "Elite Algorithmic & Coding Platform" },
    maintenanceMode: { type: Boolean, default: false },
    registrationEnabled: { type: Boolean, default: true },
    defaultTimeLimitMs: { type: Number, default: 2000 },
    defaultMemoryLimitMb: { type: Number, default: 256 },
    enabledLanguages: {
      type: [String],
      default: ["javascript", "python", "cpp", "java"]
    },
    aiCoachEnabled: { type: Boolean, default: true },
    dailyAiLimitPerUser: { type: Number, default: 50 },
    contestsEnabled: { type: Boolean, default: true }
  },
  { timestamps: true, collection: "platform_settings" }
);

export const PlatformSettings =
  mongoose.models.PlatformSettings || mongoose.model("PlatformSettings", platformSettingsSchema);

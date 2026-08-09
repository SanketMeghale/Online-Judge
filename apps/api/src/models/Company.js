import mongoose from "mongoose";

const companyProblemSchema = new mongoose.Schema(
  {
    problemId: { type: String, required: true },
    frequency: { type: Number, default: 5, min: 1, max: 5 },
    interviewTags: { type: [String], default: [] },
    year: { type: String, default: "2025-2026" },
    source: { type: String, default: "Onsite Technical Round" }
  },
  { _id: false }
);

const companySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    logo: { type: String, default: "" },
    category: {
      type: String,
      enum: ["FAANG", "Product Based", "Service Based", "Indian Product Companies", "Startups"],
      default: "Product Based",
      index: true
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Easy-Medium", "Medium", "Medium-Hard", "Hard"],
      default: "Medium-Hard"
    },
    description: { type: String, default: "" },
    tier: { type: String, default: "Tier 1" },
    frequentTopics: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    problems: { type: [companyProblemSchema], default: [] }
  },
  { timestamps: true }
);

export const Company = mongoose.models.Company || mongoose.model("Company", companySchema);

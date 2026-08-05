import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true }
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    topic: { type: String, required: true },
    acceptance: { type: Number, default: 50 },
    submissions: { type: Number, default: 0 },
    points: { type: Number, default: 10 },
    companyTags: { type: [String], default: [] },
    timeLimitMs: { type: Number, default: 2000 },
    memoryLimitMb: { type: Number, default: 256 },
    statement: { type: String, required: true },
    examples: [exampleSchema],
    hiddenTestCases: [exampleSchema],
    constraints: { type: [String], default: [] },
    starterCode: {
      javascript: String,
      python: String,
      cpp: String,
      java: String
    }
  },
  { timestamps: true }
);

export const Problem = mongoose.models.Problem || mongoose.model("Problem", problemSchema);

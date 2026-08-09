import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    id: { type: String },
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: "" },
    isSample: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false }
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, unique: true, sparse: true, index: true },
    title: { type: String, required: true, index: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true, index: true },
    topic: { type: String, required: true, index: true },
    topics: { type: [String], default: [] },
    statement: { type: String, required: true },
    constraints: { type: [String], default: [] },
    examples: [testCaseSchema],
    hiddenTestCases: [testCaseSchema],
    hints: { type: [String], default: [] },
    solutions: {
      explanation: { type: String, default: "" },
      cpp: { type: String, default: "" },
      python: { type: String, default: "" },
      javascript: { type: String, default: "" },
      java: { type: String, default: "" }
    },
    starterCode: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      cpp: { type: String, default: "" },
      java: { type: String, default: "" }
    },
    acceptance: { type: Number, default: 50 },
    submissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    points: { type: Number, default: 10 },
    companyTags: { type: [String], default: [] },
    timeLimitMs: { type: Number, default: 2000 },
    memoryLimitMb: { type: Number, default: 256 },
    status: { type: String, enum: ["draft", "published", "archived"], default: "published", index: true },
    createdBy: { type: String, default: "system" },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true, collection: "problems" }
);

problemSchema.index({ title: "text", statement: "text", topic: "text" });

export const Problem = mongoose.models.Problem || mongoose.model("Problem", problemSchema);

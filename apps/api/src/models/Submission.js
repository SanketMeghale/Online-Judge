import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    id: { type: String },
    userId: { type: String, required: true },
    problemId: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String },
    status: { type: String, default: "QUEUED" },
    verdict: { type: String, default: "PENDING" },
    statusText: { type: String, default: "Queued for evaluation" },
    runtimeMs: { type: Number, default: 0 },
    memoryMb: { type: Number, default: 14.0 },
    runtimePercentile: { type: Number, default: 50.0 },
    memoryPercentile: { type: Number, default: 50.0 },
    passCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    passedCount: { type: Number, default: 0 },
    totalCases: { type: Number, default: 0 },
    stdin: { type: String, default: "" },
    stdout: { type: String, default: "" },
    stderr: { type: String, default: "" },
    output: { type: String, default: "" },
    testcases: { type: Array, default: [] },
    testResults: { type: Array, default: [] },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true, strict: false }
);

export const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);

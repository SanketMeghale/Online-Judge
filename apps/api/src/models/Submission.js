import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    username: { type: String, default: "" },
    userDisplayName: { type: String, default: "" },
    userEmail: { type: String, default: "" },
    problemId: { type: String, required: true, index: true },
    problemTitle: { type: String, default: "" },
    contestId: { type: String, default: null, index: true },
    mode: { type: String, enum: ["SUBMIT", "RUN"], default: "SUBMIT", index: true },
    jobId: { type: String, default: "", index: true },
    language: { type: String, required: true, index: true },
    code: { type: String, default: "" },
    sourceCode: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "Accepted",
        "Wrong Answer",
        "Time Limit Exceeded",
        "Memory Limit Exceeded",
        "Runtime Error",
        "Compilation Error",
        "Pending",
        "QUEUED",
        "ACCEPTED",
        "WRONG_ANSWER",
        "TIME_LIMIT_EXCEEDED",
        "MEMORY_LIMIT_EXCEEDED",
        "RUNTIME_ERROR",
        "COMPILATION_ERROR",
        "PROCESSING",
        "COMPILING",
        "RUNNING",
        "JUDGING",
        "ANALYZING",
        "FINALIZING",
        "COMPLETED",
        "SYSTEM_ERROR"
      ],
      default: "QUEUED",
      index: true
    },
    verdict: { type: String, default: "PENDING" },
    statusText: { type: String, default: "Queued for evaluation" },
    statusHistory: {
      type: [{ status: String, at: Date }],
      default: () => [{ status: "QUEUED", at: new Date() }]
    },
    customInput: { type: String, default: "" },
    
    // Compilation metrics
    compiler: {
      name: { type: String, default: "" },
      version: { type: String, default: "" },
      status: { type: String, default: "PENDING" },
      timeMs: { type: Number, default: 0 },
      stdout: { type: String, default: "" },
      stderr: { type: String, default: "" }
    },

    // Execution metrics
    execution: {
      status: { type: String, default: "" },
      timeMs: { type: Number, default: 0 },
      peakMemoryBytes: { type: Number, default: 0 },
      peakMemoryMb: { type: Number, default: 0 },
      exitCode: { type: Number, default: 0 },
      stdout: { type: String, default: "" },
      stderr: { type: String, default: "" }
    },

    // Algorithm Big-O Complexity Analysis (Derived from actual code AST)
    complexity: {
      time: { type: String, default: "Unable to determine reliably" },
      space: { type: String, default: "Unable to determine reliably" },
      confidence: { type: String, default: "Low" },
      explanation: { type: String, default: "" }
    },

    runtimeMs: { type: Number, default: 0 },
    executionTimeMs: { type: Number, default: 0 },
    compilationTimeMs: { type: Number, default: 0 },
    memoryMb: { type: Number, default: 0 },
    memoryUsedMb: { type: Number, default: 0 },
    peakMemoryBytes: { type: Number, default: 0 },
    runtimePercentile: { type: Number, default: 0 },
    memoryPercentile: { type: Number, default: 0 },
    passCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    passedCount: { type: Number, default: 0 },
    totalCases: { type: Number, default: 0 },
    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    stdin: { type: String, default: "" },
    stdout: { type: String, default: "" },
    stderr: { type: String, default: "" },
    output: { type: String, default: "" },
    compileOutput: { type: String, default: "" },
    errorMessage: { type: String, default: "" },
    testcases: { type: Array, default: [] },
    testResults: { type: Array, default: [] },
    submittedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true, collection: "submissions", strict: false }
);

// Compound indexes for fast admin analytics & user profiles
submissionSchema.index({ userId: 1, submittedAt: -1 });
submissionSchema.index({ problemId: 1, status: 1 });
submissionSchema.index({ status: 1, submittedAt: -1 });
submissionSchema.index({ language: 1, status: 1 });

export const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);

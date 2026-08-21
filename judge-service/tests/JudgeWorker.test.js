import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { JudgeWorker } from "../src/workers/JudgeWorker.js";

describe("JudgeWorker compile-once lifecycle", () => {
  let sandbox;
  let worker;
  const submission = {
    _id: "507f1f77bcf86cd799439011",
    userId: "user-1",
    problemId: "two-sum",
    mode: "SUBMIT",
    language: "python",
    code: "print('Hello')",
    sourceCode: "print('Hello')"
  };
  const problem = {
    id: "two-sum",
    title: "Two Sum",
    status: "published",
    timeLimitMs: 2000,
    memoryLimitMb: 128,
    examples: [{ input: "a", output: "Hello" }],
    hiddenTestCases: [{ input: "b", output: "Hello" }]
  };

  beforeEach(() => {
    sandbox = {
      compileInSandbox: jest.fn().mockResolvedValue({
        ok: true,
        verdict: "AC",
        compilation: { status: "SUCCESS", compiler: "python3", name: "python3", version: "3.12", timeMs: 8 }
      }),
      executeCompiledInSandbox: jest.fn().mockResolvedValue({
        ok: true,
        verdict: "AC",
        runtimeMs: 4.5,
        peakMemoryBytes: 4_000_000,
        stdout: "Hello",
        stderr: ""
      })
    };
    worker = new JudgeWorker({ sandbox });
    jest.spyOn(worker, "loadSubmission").mockResolvedValue(submission);
    jest.spyOn(worker, "loadProblem").mockResolvedValue(problem);
    jest.spyOn(worker, "transition").mockResolvedValue();
    jest.spyOn(worker, "queueForRetry").mockResolvedValue();
    jest.spyOn(worker, "finalizeResult").mockImplementation(async (args) => args);
  });

  test("compiles once, executes every authorized testcase, and records ordered states", async () => {
    const result = await worker.processJob({ submissionId: String(submission._id) }, { jobId: "job-1", attempt: 1 });

    expect(sandbox.compileInSandbox).toHaveBeenCalledTimes(1);
    expect(sandbox.executeCompiledInSandbox).toHaveBeenCalledTimes(2);
    expect(worker.transition.mock.calls.map((call) => call[1])).toEqual([
      "COMPILING",
      "RUNNING",
      "JUDGING",
      "ANALYZING",
      "FINALIZING"
    ]);
    expect(result.verdict).toBe("AC");
    expect(result.testResults).toHaveLength(2);
    expect(result.testResults[1].visibility).toBe("HIDDEN");
  });

  test("does not execute when real compilation fails", async () => {
    sandbox.compileInSandbox.mockResolvedValue({
      ok: false,
      verdict: "CE",
      compilation: { status: "FAILED", compiler: "g++", version: "13", timeMs: 12, stderr: "syntax error" }
    });
    worker.loadSubmission.mockResolvedValue({ ...submission, language: "cpp" });

    const result = await worker.processJob({ submissionId: String(submission._id) });
    expect(sandbox.executeCompiledInSandbox).not.toHaveBeenCalled();
    expect(result.verdict).toBe("CE");
    expect(result.compiler.stderr).toContain("syntax error");
  });

  test("classifies actual stdout mismatches as wrong answer", async () => {
    sandbox.executeCompiledInSandbox.mockResolvedValue({
      ok: true,
      verdict: "AC",
      runtimeMs: 3.25,
      peakMemoryBytes: 3_000_000,
      stdout: "not-the-expected-output",
      stderr: ""
    });
    const result = await worker.processJob({ submissionId: String(submission._id) });
    expect(result.verdict).toBe("WA");
    expect(result.testResults.every((testcase) => testcase.verdict === "WA")).toBe(true);
  });

  test("preserves runtime errors as user-code verdicts without retrying", async () => {
    sandbox.executeCompiledInSandbox.mockResolvedValue({
      ok: false,
      verdict: "RE",
      runtimeMs: 2,
      peakMemoryBytes: 2_000_000,
      stdout: "",
      stderr: "division by zero"
    });
    const result = await worker.processJob({ submissionId: String(submission._id) });
    expect(result.verdict).toBe("RE");
    expect(worker.queueForRetry).not.toHaveBeenCalled();
  });

  test("treats a sandbox creation failure as retryable infrastructure failure", async () => {
    sandbox.compileInSandbox.mockResolvedValue({
      ok: false,
      verdict: "SYSTEM_ERROR",
      infrastructureError: true,
      compilation: { status: "FAILED", stderr: "Docker unavailable" }
    });
    await expect(worker.processJob({ submissionId: String(submission._id) })).rejects.toThrow("Sandbox compilation service failed.");
    expect(worker.finalizeResult).not.toHaveBeenCalled();
  });
});

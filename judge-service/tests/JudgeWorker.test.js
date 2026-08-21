import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { JudgeWorker } from "../src/workers/JudgeWorker.js";
import { executorFactory } from "../src/executors/ExecutorFactory.js";

describe("JudgeWorker Core Engine Unit Tests", () => {
  let worker;

  beforeEach(() => {
    jest.restoreAllMocks();
    worker = new JudgeWorker();
    jest.spyOn(worker, "loadTestCases").mockResolvedValue([{ input: "", output: "Hello" }]);
    // Mock DB updates to avoid needing real MongoDB instance during unit tests
    jest.spyOn(worker, "updateDatabase").mockResolvedValue(true);
    jest.spyOn(worker, "broadcastRealtimeUpdate").mockResolvedValue(true);
    jest.spyOn(executorFactory, "getExecutor").mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        ok: true,
        verdict: "AC",
        statusText: "Accepted",
        runtimeMs: 10,
        memoryMb: 0,
        stdout: "Hello",
        stderr: ""
      })
    });
  });

  test("1. Successfully processes Python code submission job and returns final verdict", async () => {
    const jobData = {
      submissionId: "S-JW-101",
      problemId: "two-sum",
      userId: "u-demo-1",
      language: "python",
      code: "print('Hello')",
      testcases: [{ input: "attacker-controlled", output: "Wrong" }]
    };

    const result = await worker.processJob(jobData);

    expect(result.submissionId).toBe("S-JW-101");
    expect(result.verdict).toBe("AC");
    expect(result.statusText).toBe("Accepted");
    expect(result.passCount).toBe(1);
    expect(result.totalCount).toBe(1);
    expect(worker.updateDatabase).toHaveBeenCalled();
    expect(worker.broadcastRealtimeUpdate).toHaveBeenCalled();
    expect(worker.loadTestCases).toHaveBeenCalledWith("two-sum");
  });

  test("2. Detects compilation errors and short-circuits testcase evaluation", async () => {
    executorFactory.getExecutor.mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        ok: false,
        verdict: "CE",
        statusText: "Compilation Error",
        runtimeMs: 0,
        memoryMb: 0,
        stdout: "",
        stderr: "invalid syntax"
      })
    });
    const jobData = {
      submissionId: "S-JW-CE-102",
      problemId: "two-sum",
      userId: "u-demo-1",
      language: "cpp",
      code: "int main() { invalid_syntax }",
      testcases: [{ input: "attacker-controlled", output: "Wrong" }]
    };

    const result = await worker.processJob(jobData);

    expect(result.verdict).toBe("CE");
    expect(result.statusText).toBe("Compilation Error");
    expect(result.passCount).toBe(0);
  });

  test("3. Handles unsupported programming language with a canonical system error", async () => {
    const jobData = {
      submissionId: "S-JW-ERR-103",
      language: "cobol_invalid_lang",
      code: "DISPLAY 'Hello'"
    };

    const result = await worker.processJob(jobData);

    expect(result.verdict).toBe("SYSTEM_ERROR");
    expect(result.statusText).toBe("System Error");
    expect(result.description).toContain("Unsupported programming language");
  });
});

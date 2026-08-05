import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { JudgeWorker } from "../src/workers/JudgeWorker.js";

describe("JudgeWorker Core Engine Unit Tests", () => {
  let worker;

  beforeEach(() => {
    worker = new JudgeWorker();
    // Mock DB updates to avoid needing real MongoDB instance during unit tests
    jest.spyOn(worker, "updateDatabase").mockResolvedValue(true);
    jest.spyOn(worker, "broadcastRealtimeUpdate").mockResolvedValue(true);
  });

  test("1. Successfully processes Python code submission job and returns final verdict", async () => {
    const jobData = {
      submissionId: "S-JW-101",
      problemId: "two-sum",
      userId: "u-demo-1",
      language: "python",
      code: "print('Hello')",
      testcases: [
        { input: "", output: "Hello" }
      ]
    };

    const result = await worker.processJob(jobData);

    expect(result.submissionId).toBe("S-JW-101");
    expect(result.verdict).toBe("AC");
    expect(result.statusText).toBe("Accepted");
    expect(result.passCount).toBe(1);
    expect(result.totalCount).toBe(1);
    expect(worker.updateDatabase).toHaveBeenCalled();
    expect(worker.broadcastRealtimeUpdate).toHaveBeenCalled();
  });

  test("2. Detects compilation errors and short-circuits testcase evaluation", async () => {
    const jobData = {
      submissionId: "S-JW-CE-102",
      problemId: "two-sum",
      userId: "u-demo-1",
      language: "cpp",
      code: "int main() { invalid_syntax }",
      testcases: [
        { input: "", output: "Hello" }
      ]
    };

    const result = await worker.processJob(jobData);

    expect(result.verdict).toBe("CE");
    expect(result.statusText).toBe("Compilation Error");
    expect(result.passCount).toBe(0);
  });

  test("3. Handles unsupported programming language gracefully with SE (System Error)", async () => {
    const jobData = {
      submissionId: "S-JW-ERR-103",
      language: "cobol_invalid_lang",
      code: "DISPLAY 'Hello'"
    };

    const result = await worker.processJob(jobData);

    expect(result.verdict).toBe("SE");
    expect(result.statusText).toBe("System Error");
    expect(result.description).toContain("Unsupported programming language");
  });
});

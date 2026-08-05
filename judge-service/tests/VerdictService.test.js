import { VerdictService, VerdictEnum, verdictService } from "../src/services/VerdictService.js";

describe("VerdictService Unit Tests", () => {
  let service;

  beforeEach(() => {
    service = new VerdictService();
  });

  test("1. Returns AC (Accepted) when all testcases pass", () => {
    const testcaseResults = [
      { executionResult: { ok: true, verdict: "AC", runtimeMs: 15, memoryMb: 12 }, comparatorResult: { verdict: "AC", isMatch: true } },
      { executionResult: { ok: true, verdict: "AC", runtimeMs: 20, memoryMb: 14 }, comparatorResult: { verdict: "AC", isMatch: true } }
    ];

    const aggregated = service.aggregateTestcaseVerdicts(testcaseResults);

    expect(aggregated.verdict).toBe("AC");
    expect(aggregated.statusText).toBe("Accepted");
    expect(aggregated.passCount).toBe(2);
    expect(aggregated.totalCount).toBe(2);
    expect(aggregated.runtimeMs).toBe(20); // Max runtime
  });

  test("2. Prioritizes CE (Compilation Error) over other testcase failures", () => {
    const testcaseResults = [
      { executionResult: { ok: false, verdict: "CE", stderr: "Syntax error" }, comparatorResult: null }
    ];

    const aggregated = service.aggregateTestcaseVerdicts(testcaseResults);

    expect(aggregated.verdict).toBe("CE");
    expect(aggregated.statusText).toBe("Compilation Error");
    expect(aggregated.passCount).toBe(0);
  });

  test("3. Prioritizes TLE (Time Limit Exceeded) over WA", () => {
    const testcaseResults = [
      { executionResult: { ok: true, verdict: "AC" }, comparatorResult: { verdict: "AC", isMatch: true } },
      { executionResult: { ok: false, verdict: "TLE", runtimeMs: 2000 }, comparatorResult: null },
      { executionResult: { ok: true, verdict: "AC" }, comparatorResult: { verdict: "WA", isMatch: false } }
    ];

    const aggregated = service.aggregateTestcaseVerdicts(testcaseResults);

    expect(aggregated.verdict).toBe("TLE");
    expect(aggregated.statusText).toContain("Time Limit Exceeded");
  });

  test("4. Prioritizes WA (Wrong Answer) if output mismatches", () => {
    const testcaseResults = [
      { executionResult: { ok: true, verdict: "AC" }, comparatorResult: { verdict: "AC", isMatch: true } },
      { executionResult: { ok: true, verdict: "AC" }, comparatorResult: { verdict: "WA", isMatch: false } }
    ];

    const aggregated = service.aggregateTestcaseVerdicts(testcaseResults);

    expect(aggregated.verdict).toBe("WA");
    expect(aggregated.statusText).toBe("Wrong Answer");
    expect(aggregated.passCount).toBe(1);
    expect(aggregated.totalCount).toBe(2);
  });

  test("5. Validates clean Verdict Enum mappings", () => {
    expect(VerdictEnum.ACCEPTED).toBe("AC");
    expect(VerdictEnum.WRONG_ANSWER).toBe("WA");
    expect(VerdictEnum.COMPILATION_ERROR).toBe("CE");
    expect(VerdictEnum.RUNTIME_ERROR).toBe("RE");
    expect(VerdictEnum.MEMORY_LIMIT_EXCEEDED).toBe("MLE");
    expect(VerdictEnum.TIME_LIMIT_EXCEEDED).toBe("TLE");
    expect(VerdictEnum.SYSTEM_ERROR).toBe("SE");
  });
});

import { jest, describe, test, expect, beforeEach, afterAll } from "@jest/globals";
import { LoggerService } from "../src/services/LoggerService.js";
import fs from "fs";
import path from "path";

describe("LoggerService Unit Tests", () => {
  let loggerService;
  const testLogsDir = path.resolve(process.cwd(), "test_logs_tmp");

  beforeEach(() => {
    loggerService = new LoggerService({ logsDir: testLogsDir });
  });

  afterAll((done) => {
    try {
      if (loggerService?.logger) loggerService.logger.close();
      if (loggerService?.submissionLogger) loggerService.submissionLogger.close();
    } catch (e) {}

    setTimeout(() => {
      if (fs.existsSync(testLogsDir)) {
        try {
          fs.rmSync(testLogsDir, { recursive: true, force: true });
        } catch (e) {}
      }
      done();
    }, 500);
  });

  test("1. Initializes logs directory upon creation", () => {
    expect(fs.existsSync(testLogsDir)).toBe(true);
  });

  test("2. Logs Submission Received event cleanly", () => {
    const spy = jest.spyOn(loggerService.logger, "info");
    loggerService.logSubmissionReceived({
      submissionId: "S-LOG-1",
      problemId: "two-sum",
      userId: "u-1",
      language: "python"
    });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[SUBMISSION_RECEIVED] Submission 'S-LOG-1' for problem 'two-sum'")
    );
  });

  test("3. Logs Execution Started event", () => {
    const spy = jest.spyOn(loggerService.logger, "info");
    loggerService.logExecutionStarted({
      submissionId: "S-LOG-2",
      language: "cpp",
      workingDir: "/tmp/oj-sandbox-123"
    });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[EXECUTION_STARTED] Sandboxed execution started for submission 'S-LOG-2'")
    );
  });

  test("4. Logs Compilation Finished event", () => {
    const spy = jest.spyOn(loggerService.logger, "info");
    loggerService.logCompilationFinished({
      submissionId: "S-LOG-3",
      language: "java",
      success: true,
      durationMs: 120
    });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[COMPILATION_FINISHED] Compilation SUCCESS for submission 'S-LOG-3'")
    );
  });

  test("5. Logs Verdict event", () => {
    const spy = jest.spyOn(loggerService.logger, "info");
    loggerService.logVerdict({
      submissionId: "S-LOG-4",
      verdict: "AC",
      statusText: "Accepted",
      passCount: 5,
      totalCount: 5
    });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[VERDICT_GENERATED] Submission 'S-LOG-4' verdict -> AC")
    );
  });

  test("6. Logs Execution Time & Memory Metrics", () => {
    const spy = jest.spyOn(loggerService.logger, "info");
    loggerService.logExecutionMetrics({
      submissionId: "S-LOG-5",
      executionTimeMs: 42,
      memoryMb: 14.2
    });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[EXECUTION_METRICS] Submission 'S-LOG-5' metrics -> Execution Time: 42ms, Memory: 14.2MB")
    );
  });

  test("7. Logs Errors & Exception tracebacks", () => {
    const spy = jest.spyOn(loggerService.logger, "error");
    const testErr = new Error("Docker Daemon Connection Failure");

    loggerService.logError({
      submissionId: "S-LOG-ERR",
      context: "DockerService",
      error: testErr
    });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[EXECUTION_ERROR] Error in 'DockerService' for submission 'S-LOG-ERR': Docker Daemon Connection Failure"),
      expect.anything()
    );
  });
});

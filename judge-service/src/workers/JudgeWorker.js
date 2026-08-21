import { executorFactory } from "../executors/ExecutorFactory.js";
import { languageRegistry } from "../config/languages.js";
import { tempFileService } from "../services/TempFileService.js";
import { outputComparator } from "../services/OutputComparator.js";
import { verdictService } from "../services/VerdictService.js";
import { loggerService } from "../services/LoggerService.js";
import { monitoringService } from "../services/MonitoringService.js";
import { Submission } from "../../../apps/api/src/models/Submission.js";
import { Problem } from "../../../apps/api/src/models/Problem.js";
import { User } from "../../../apps/api/src/models/User.js";
import mongoose from "mongoose";
import { wrapCodeWithHarness } from "../../../apps/api/src/lib/codeHarness.js";

/**
 * JudgeWorker - Asynchronous Code Evaluation Worker Engine
 */
export class JudgeWorker {
  async loadTestCases(problemId) {
    if (!problemId) throw new Error("A problem ID is required for judging.");
    const dbProblem = await Problem.findOne({
      id: String(problemId),
      isDeleted: { $ne: true },
      status: "published"
    }).lean();
    if (!dbProblem) throw new Error("The submitted problem does not exist or is not published.");
    const testcases = [...(dbProblem.examples || []), ...(dbProblem.hiddenTestCases || [])];
    if (testcases.length === 0) throw new Error("No server-managed test cases were found for this problem.");
    return testcases;
  }

  async processJob(jobData) {
    const startTime = Date.now();
    const { submissionId, problemId, userId, language, code } = jobData;

    // Log 1: Submission Received
    loggerService.logSubmissionReceived({
      submissionId: submissionId || "demo",
      problemId: problemId || "unknown",
      userId: userId || "guest",
      language
    });

    try {
      // Step 2: Get Language Config & Resolve Executor via ExecutorFactory
      const langConfig = languageRegistry.get(language);
      if (!langConfig) {
        throw new Error(`Unsupported programming language: '${language}'`);
      }

      const executor = executorFactory.getExecutor(language);

      // Log 2: Execution Started
      loggerService.logExecutionStarted({
        submissionId: submissionId || "demo",
        language: langConfig.id
      });

      // Step 3: Resolve Testcases
      const testcases = await this.loadTestCases(problemId);

      const testcaseResults = [];

      // Step 4 & 5: Execute code & Compare output for each testcase
      for (let i = 0; i < testcases.length; i++) {
        const tc = testcases[i];
        const inputData = tc.input || tc.stdin || "";
        const expectedData = tc.output || tc.expectedOutput || "";

        let tempDir = null;
        let execResult = null;
        let compResult = null;

        try {
          tempDir = await tempFileService.createTempDirectory();

          const executableCode = wrapCodeWithHarness({
            code,
            language: langConfig.id,
            problemId,
            stdin: inputData
          });
          await tempFileService.writeSourceCode(tempDir, langConfig.sourceFileName, executableCode);
          await tempFileService.writeInput(tempDir, inputData);

          execResult = await executor.execute({
            code,
            stdin: inputData,
            expectedOutput: expectedData,
            timeoutMs: langConfig.timeLimitMs,
            workingDir: tempDir
          });

          // Log 3: Compilation Finished (if applicable)
          if (execResult.verdict === "CE") {
            loggerService.logCompilationFinished({
              submissionId: submissionId || "demo",
              language: langConfig.id,
              success: false,
              durationMs: execResult.runtimeMs,
              error: execResult.stderr
            });
          } else {
            loggerService.logCompilationFinished({
              submissionId: submissionId || "demo",
              language: langConfig.id,
              success: true,
              durationMs: execResult.runtimeMs
            });
          }

          if (execResult.ok) {
            compResult = outputComparator.compare(execResult.stdout, expectedData);
          }
        } catch (tcErr) {
          execResult = {
            ok: false,
            verdict: "RE",
            statusText: "Runtime Error",
            runtimeMs: Date.now() - startTime,
            memoryMb: 0,
            stdout: "",
            stderr: tcErr.message || "Testcase execution exception"
          };
        } finally {
          if (tempDir) {
            await tempFileService.cleanup(tempDir);
          }
        }

        testcaseResults.push({
          id: tc._id || tc.id || i + 1,
          testcaseIndex: i + 1,
          executionResult: execResult,
          comparatorResult: compResult
        });

        if (execResult && execResult.verdict === "CE") {
          break;
        }
      }

      // Step 6: Generate Final Verdict via VerdictService
      const aggregatedVerdict = verdictService.aggregateTestcaseVerdicts(testcaseResults);

      const firstTc = aggregatedVerdict.testcases?.[0] || {};
      const finalResult = {
        submissionId,
        problemId,
        userId,
        language: langConfig.id,
        status: "COMPLETED",
        verdict: aggregatedVerdict.verdict,
        statusText: aggregatedVerdict.statusText,
        description: aggregatedVerdict.description,
        badgeColor: aggregatedVerdict.badgeColor,
        passCount: aggregatedVerdict.passCount,
        totalCount: aggregatedVerdict.totalCount,
        runtimeMs: aggregatedVerdict.runtimeMs,
        memoryMb: aggregatedVerdict.memoryMb,
        stdout: firstTc.stdout || "",
        stderr: firstTc.stderr || "",
        output: firstTc.stdout || firstTc.stderr || "",
        expectedOutput: firstTc.expectedOutput || "",
        testcases: aggregatedVerdict.testcases,
        completedAt: new Date()
      };

      console.log(`[JudgeWorker] [VERDICT] submissionId: ${submissionId} -> ${finalResult.verdict} (${finalResult.statusText})`);
      console.log(`[JudgeWorker] [METRICS] runtime: ${finalResult.runtimeMs}ms, memory: ${finalResult.memoryMb}MB, passed: ${finalResult.passCount}/${finalResult.totalCount}`);

      // Record Execution Metrics in MonitoringService
      monitoringService.recordExecution(finalResult.runtimeMs);

      // Log Verdict & Execution Metrics
      loggerService.logVerdict({
        submissionId: submissionId || "demo",
        verdict: finalResult.verdict,
        statusText: finalResult.statusText,
        passCount: finalResult.passCount,
        totalCount: finalResult.totalCount
      });

      loggerService.logExecutionMetrics({
        submissionId: submissionId || "demo",
        executionTimeMs: finalResult.runtimeMs,
        memoryMb: finalResult.memoryMb
      });

      // Step 7: Update MongoDB Submission & User Stats
      await this.updateDatabase(finalResult);

      // Step 8: Emit Completion Event via RabbitMQ & Realtime Socket.IO
      await this.broadcastRealtimeUpdate(finalResult);

      return finalResult;
    } catch (err) {
      if (err?.code === "JUDGE_PERSISTENCE_ERROR") throw err;
      // Log Errors & Exceptions
      loggerService.logError({
        submissionId: submissionId || "demo",
        context: "JudgeWorker",
        error: err
      });

      const errorVerdict = {
        submissionId,
        problemId,
        userId,
        language,
        status: "COMPLETED",
        verdict: "SYSTEM_ERROR",
        statusText: "System Error",
        description: err.message || "Internal Judge Worker Failure",
        badgeColor: "red",
        passCount: 0,
        totalCount: 0,
        runtimeMs: Date.now() - startTime,
        memoryMb: 0,
        stdout: "",
        stderr: err.message || "System error",
        testcases: [],
        completedAt: new Date()
      };

      await this.updateDatabase(errorVerdict);
      await this.broadcastRealtimeUpdate(errorVerdict);

      return errorVerdict;
    }
  }

  /**
   * Broadcasts Socket.IO submission:update event to Realtime Service
   * @param {Object} resPayload
   */
  async broadcastRealtimeUpdate(resPayload) {
    if (!resPayload || !resPayload.submissionId) return;

    try {
      const REALTIME_URL = process.env.REALTIME_SERVICE_URL || "http://localhost:4001";
      const response = await fetch(`${REALTIME_URL}/api/realtime/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REALTIME_INTERNAL_SECRET || ""}`
        },
        body: JSON.stringify({
          event: "submission:update",
          payload: {
            submissionId: resPayload.submissionId,
            problemId: resPayload.problemId,
            userId: resPayload.userId,
            status: "COMPLETED",
            verdict: resPayload.verdict,
            statusText: resPayload.statusText,
            runtime: typeof resPayload.runtimeMs === "number" ? `${resPayload.runtimeMs} ms` : (resPayload.runtime || "-"),
            runtimeMs: resPayload.runtimeMs,
            memory: typeof resPayload.memoryMb === "number" ? `${resPayload.memoryMb} MB` : (resPayload.memory || "-"),
            memoryMb: resPayload.memoryMb,
            passCount: resPayload.passCount,
            totalCount: resPayload.totalCount,
            passedCount: resPayload.passCount,
            totalCases: resPayload.totalCount,
            diagnostic: resPayload.verdict === "CE" ? String(resPayload.stderr || "").slice(0, 16000) : "",
            testResults: (resPayload.testcases || []).map((item) => ({
              id: item.id,
              testCase: item.testCase ?? item.testcaseIndex,
              status: item.status,
              passed: Boolean(item.passed),
              verdict: item.verdict,
              execution_time_ms: item.execution_time_ms ?? item.runtimeMs ?? 0,
              memory_kb: item.memory_kb ?? 0
            }))
          }
        })
      });
      if (!response.ok) {
        throw new Error(`Realtime service returned HTTP ${response.status}`);
      }
      console.log(`[JudgeWorker] [REALTIME_BROADCAST] Emitted submission:update for ${resPayload.submissionId}`);
    } catch (err) {
      console.warn(`[JudgeWorker] Realtime update unavailable: ${err.message}`);
    }
  }

  /**
   * Step 7: Updates Submission and User records in MongoDB database
   * @param {Object} finalResult
   */
  async updateDatabase(finalResult) {
    if (!finalResult.submissionId) return;

    try {
      console.log(`[JudgeWorker] [MONGODB_UPDATE] Updating submission ${finalResult.submissionId} -> verdict: ${finalResult.verdict}`);
      // 1. Update Submission Document with stdout, stderr, status, and metrics
      await Submission.findByIdAndUpdate(
        finalResult.submissionId,
        {
          status: "COMPLETED",
          verdict: finalResult.verdict,
          statusText: finalResult.statusText,
          passCount: finalResult.passCount,
          totalCount: finalResult.totalCount,
          runtimeMs: finalResult.runtimeMs,
          memoryMb: finalResult.memoryMb,
          stdout: finalResult.stdout || "",
          stderr: finalResult.stderr || "",
          testcases: finalResult.testcases || [],
          completedAt: finalResult.completedAt || new Date()
        },
        { new: true }
      );

      // 2. If Verdict is Accepted (AC) and User ID exists, update User solved stats & XP
      if (finalResult.verdict === "AC" && finalResult.userId) {
        const userQuery = mongoose.Types.ObjectId.isValid(String(finalResult.userId))
          ? { $or: [{ _id: finalResult.userId }, { id: String(finalResult.userId) }] }
          : { id: String(finalResult.userId) };
        await User.findOneAndUpdate(
          userQuery,
          {
            $addToSet: { solvedProblemIds: finalResult.problemId, attemptedProblemIds: finalResult.problemId },
            $inc: { xp: 50, "stats.totalSubmissions": 1, "stats.acceptedSubmissions": 1 }
          }
        );
      } else if (finalResult.userId) {
        const userQuery = mongoose.Types.ObjectId.isValid(String(finalResult.userId))
          ? { $or: [{ _id: finalResult.userId }, { id: String(finalResult.userId) }] }
          : { id: String(finalResult.userId) };
        await User.findOneAndUpdate(
          userQuery,
          {
            $addToSet: { attemptedProblemIds: finalResult.problemId },
            $inc: { "stats.totalSubmissions": 1 }
          }
        );
      }
      console.log(`[JudgeWorker] [MONGODB_UPDATE_SUCCESS] Submission ${finalResult.submissionId} updated in MongoDB.`);
    } catch (dbErr) {
      console.warn(`[JudgeWorker] MongoDB record update notice: ${dbErr.message}`);
      const persistenceError = new Error("Failed to persist judge result.", { cause: dbErr });
      persistenceError.code = "JUDGE_PERSISTENCE_ERROR";
      throw persistenceError;
    }
  }
}

// Export singleton instance
export const judgeWorker = new JudgeWorker();

// Default export for import flexibility
export default judgeWorker;

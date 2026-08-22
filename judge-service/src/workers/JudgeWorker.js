import mongoose from "mongoose";
import { Submission } from "../../../apps/api/src/models/Submission.js";
import { Problem } from "../../../apps/api/src/models/Problem.js";
import { User } from "../../../apps/api/src/models/User.js";
import { wrapCodeWithHarness } from "../../../apps/api/src/lib/codeHarness.js";
import { analyzeCodeComplexity } from "../../../apps/api/src/lib/complexityEngine.js";
import { problems as seedProblems } from "../../../apps/api/src/data/problems.js";
import { languageRegistry } from "../config/languages.js";
import { tempFileService } from "../services/TempFileService.js";
import { dockerService } from "../services/DockerService.js";
import { outputComparator } from "../services/OutputComparator.js";
import { monitoringService } from "../services/MonitoringService.js";
import { adaptTestcaseInput } from "../testcase/InputAdapter.js";

const VERDICT_STATUS = Object.freeze({
  AC: "ACCEPTED",
  WA: "WRONG_ANSWER",
  CE: "COMPILATION_ERROR",
  RE: "RUNTIME_ERROR",
  TLE: "TIME_LIMIT_EXCEEDED",
  MLE: "MEMORY_LIMIT_EXCEEDED",
  SYSTEM_ERROR: "SYSTEM_ERROR"
});

const VERDICT_TEXT = Object.freeze({
  AC: "Accepted",
  WA: "Wrong Answer",
  CE: "Compilation Error",
  RE: "Runtime Error",
  TLE: "Time Limit Exceeded",
  MLE: "Memory Limit Exceeded",
  SYSTEM_ERROR: "System Error"
});

function resultPriority(verdict) {
  return { CE: 100, SYSTEM_ERROR: 90, MLE: 80, TLE: 70, RE: 60, WA: 50, AC: 0 }[verdict] ?? 90;
}

function publicRealtimeTest(result) {
  const safe = {
    id: result.id,
    number: result.number,
    status: result.status,
    passed: result.passed,
    verdict: result.verdict,
    executionTimeMs: result.executionTimeMs,
    peakMemoryBytes: result.peakMemoryBytes,
    visibility: result.visibility
  };
  if (result.visibility !== "HIDDEN") {
    safe.input = result.input;
    safe.expectedOutput = result.expectedOutput;
    safe.actualOutput = result.actualOutput;
    safe.stdout = result.stdout;
    safe.stderr = result.stderr;
    safe.difference = result.difference;
  }
  return safe;
}

export class JudgeWorker {
  constructor({ sandbox = dockerService } = {}) {
    this.sandbox = sandbox;
    this.workerId = process.env.WORKER_ID || `${process.env.HOSTNAME || "worker"}-${process.pid}`;
  }

  log(event, context = {}) {
    console.log(JSON.stringify({
      event,
      workerId: this.workerId,
      timestamp: new Date().toISOString(),
      ...context
    }));
  }

  async loadSubmission(submissionId) {
    if (!submissionId || !mongoose.Types.ObjectId.isValid(String(submissionId))) {
      throw new Error("A valid persisted submission ID is required.");
    }
    const submission = await Submission.findById(submissionId).lean();
    if (!submission) throw new Error("The queued submission no longer exists.");
    return submission;
  }

  async loadProblem(problemId) {
    const problem = await Problem.findOne({
      id: String(problemId),
      isDeleted: { $ne: true },
      status: "published"
    }).lean();
    const localProblem = seedProblems.find((item) => String(item.id) === String(problemId));
    if (!problem && !localProblem) throw new Error("The submitted problem does not exist or is not published.");
    return problem || localProblem;
  }

  buildTestcases(problem, submission) {
    if (submission.mode === "RUN" && submission.customInput) {
      return [{ input: submission.customInput, output: null, visibility: "PUBLIC", custom: true }];
    }
    const publicCases = (problem.examples || []).map((testcase) => ({
      ...testcase,
      visibility: "PUBLIC"
    }));
    if (submission.mode === "RUN") return publicCases;
    const hiddenCases = (problem.hiddenTestCases || []).map((testcase) => ({
      ...testcase,
      visibility: "HIDDEN"
    }));
    return [...publicCases, ...hiddenCases];
  }

  async transition(submissionId, status, statusText = status) {
    const updated = await Submission.findByIdAndUpdate(submissionId, {
      $set: { status, statusText },
      $push: { statusHistory: { status, at: new Date() } }
    }, { new: true }).lean();
    await this.broadcastRealtimeUpdate({
      submissionId,
      problemId: updated?.problemId,
      userId: updated?.userId ? String(updated.userId) : undefined,
      language: updated?.language,
      status,
      statusText,
      verdict: "PENDING"
    });
  }

  async queueForRetry(submissionId) {
    await Submission.findByIdAndUpdate(submissionId, {
      $set: { status: "QUEUED", statusText: "Queued for infrastructure retry..." },
      $push: { statusHistory: { status: "QUEUED", at: new Date() } }
    });
  }

  async processJob(jobData, jobContext = {}) {
    const startedAt = new Date();
    const submission = await this.loadSubmission(jobData?.submissionId);
    const submissionId = String(submission._id);
    const { problemId, userId, language } = submission;
    const code = submission.sourceCode || submission.code;
    const langConfig = languageRegistry.get(language);
    if (!langConfig) throw new Error(`Unsupported programming language: '${language}'`);

    this.log("execution_started", {
      submissionId,
      jobId: jobContext.jobId,
      attempt: jobContext.attempt,
      userId: String(userId),
      language: langConfig.id,
      startTime: startedAt.toISOString()
    });

    let tempDir;
    try {
      const problem = await this.loadProblem(problemId);
      const testcases = this.buildTestcases(problem, submission);
      if (!testcases.length) throw new Error("No server-managed testcases were found for this problem.");

      const executionTimeLimitMs = Math.max(
        100,
        Math.min(
          Number(problem.timeLimitMs || langConfig.timeLimitMs),
          Number(process.env.MAX_EXECUTION_TIME_MS || 10_000)
        )
      );
      const memoryLimitMb = Math.max(
        32,
        Math.min(
          Number(problem.memoryLimitMb || langConfig.memoryLimitMb),
          Number(process.env.MAX_MEMORY_MB || 256)
        )
      );
      const compileTimeoutMs = Math.max(1000, Number(process.env.MAX_COMPILATION_TIME_MS || 15_000));

      tempDir = await tempFileService.createTempDirectory();
      const executableCode = wrapCodeWithHarness({
        code,
        language: langConfig.id,
        problemId,
        stdin: ""
      });
      await tempFileService.writeSourceCode(tempDir, langConfig.sourceFileName, executableCode);

      await this.transition(submissionId, "COMPILING", "Compiling...");
      const compileResult = await this.sandbox.compileInSandbox({
        hostTempDir: tempDir,
        language: langConfig.id,
        image: langConfig.dockerImage,
        memoryLimitMb,
        timeoutMs: compileTimeoutMs
      });
      if (compileResult.infrastructureError || compileResult.verdict === "SYSTEM_ERROR") {
        const error = new Error("Sandbox compilation service failed.");
        error.infrastructureFailure = true;
        throw error;
      }
      if (!compileResult.ok) {
        return this.finalizeResult({
          submission,
          problem,
          compiler: compileResult.compilation,
          verdict: "CE",
          testResults: [],
          complexity: analyzeCodeComplexity({ code, language: langConfig.id, problemTitle: problem.title }),
          totalTestcases: testcases.length,
          startedAt,
          jobContext
        });
      }

      await this.transition(submissionId, "RUNNING", "Running...");
      const rawResults = [];
      for (let index = 0; index < testcases.length; index++) {
        const testcase = testcases[index];
        const input = adaptTestcaseInput(problemId, langConfig.id, testcase.input || testcase.stdin || "");
        await tempFileService.writeInput(tempDir, input);
        const execution = await this.sandbox.executeCompiledInSandbox({
          hostTempDir: tempDir,
          language: langConfig.id,
          image: langConfig.dockerImage,
          memoryLimitMb,
          timeoutMs: executionTimeLimitMs
        });
        if (execution.infrastructureError || execution.verdict === "SYSTEM_ERROR") {
          const error = new Error("Sandbox execution service failed.");
          error.infrastructureFailure = true;
          throw error;
        }
        rawResults.push({ testcase, execution, index });
      }

      await this.transition(submissionId, "JUDGING", "Checking testcases...");
      const testResults = rawResults.map(({ testcase, execution, index }) => {
        const comparison = execution.ok && testcase.output !== null
          ? outputComparator.compare(execution.stdout, testcase.output || testcase.expectedOutput || "")
          : null;
        const verdict = !execution.ok
          ? execution.verdict
          : comparison && !comparison.isMatch
          ? "WA"
          : "AC";
        const result = {
          id: testcase._id || testcase.id || index + 1,
          number: index + 1,
          status: VERDICT_STATUS[verdict] || "SYSTEM_ERROR",
          verdict,
          passed: verdict === "AC",
          visibility: testcase.visibility,
          executionTimeMs: Number(execution.runtimeMs || 0),
          peakMemoryBytes: Number(execution.peakMemoryBytes || 0)
        };
        if (testcase.visibility !== "HIDDEN") {
          result.input = testcase.input || testcase.stdin || "";
          result.expectedOutput = testcase.output ?? testcase.expectedOutput ?? "";
          result.actualOutput = execution.stdout || "";
          result.difference = comparison?.difference || "";
          result.stdout = execution.stdout || "";
          result.stderr = execution.stderr || "";
        }
        return result;
      });

      let verdict = "AC";
      for (const result of testResults) {
        if (resultPriority(result.verdict) > resultPriority(verdict)) verdict = result.verdict;
      }

      await this.transition(submissionId, "ANALYZING", "Analyzing complexity...");
      const complexity = analyzeCodeComplexity({ code, language: langConfig.id, problemTitle: problem.title });
      await this.transition(submissionId, "FINALIZING", "Finalizing...");
      return this.finalizeResult({
        submission,
        problem,
        compiler: compileResult.compilation,
        verdict,
        testResults,
        complexity,
        totalTestcases: testcases.length,
        startedAt,
        jobContext
      });
    } catch (error) {
      await this.queueForRetry(submissionId).catch(() => {});
      this.log("execution_infrastructure_failure", {
        submissionId,
        jobId: jobContext.jobId,
        userId: String(userId),
        language,
        error: error.message
      });
      throw error;
    } finally {
      if (tempDir) await tempFileService.cleanup(tempDir);
    }
  }

  async finalizeResult({ submission, compiler, verdict, testResults, totalTestcases, complexity, startedAt, jobContext }) {
    const submissionId = String(submission._id);
    const endedAt = new Date();
    const passed = testResults.filter((result) => result.passed).length;
    const executionTimeMs = testResults.reduce((max, result) => Math.max(max, result.executionTimeMs || 0), 0);
    const totalExecutionTimeMs = testResults.reduce((total, result) => total + (result.executionTimeMs || 0), 0);
    const peakMemoryBytes = testResults.reduce((max, result) => Math.max(max, result.peakMemoryBytes || 0), 0);
    const terminalStatus = VERDICT_STATUS[verdict] || "SYSTEM_ERROR";
    const statusText = VERDICT_TEXT[verdict] || "System Error";
    const firstResult = testResults[0];
    const execution = verdict === "CE" ? null : {
      status: terminalStatus,
      timeMs: executionTimeMs,
      totalTimeMs: Number(totalExecutionTimeMs.toFixed(3)),
      peakMemoryBytes,
      peakMemoryMb: Number((peakMemoryBytes / 1024 / 1024).toFixed(2)),
      exitCode: verdict === "AC" || verdict === "WA" ? 0 : 1
    };

    const recordedTotal = Number(totalTestcases || testResults.length);
    const update = {
      $set: {
        status: terminalStatus,
        verdict,
        statusText,
        compiler,
        execution,
        complexity,
        passCount: passed,
        passedCount: passed,
        totalCount: recordedTotal,
        totalCases: recordedTotal,
        runtimeMs: executionTimeMs,
        executionTimeMs,
        compilationTimeMs: Number(compiler?.timeMs || 0),
        memoryMb: execution?.peakMemoryMb || 0,
        peakMemoryBytes,
        stdout: firstResult?.visibility === "PUBLIC" ? firstResult.stdout : "",
        stderr: verdict === "CE" ? compiler?.stderr || "" : firstResult?.visibility === "PUBLIC" ? firstResult?.stderr || "" : "",
        compileOutput: verdict === "CE" ? compiler?.stderr || "" : "",
        testcases: testResults,
        completedAt: endedAt
      },
      $push: { statusHistory: { status: terminalStatus, at: endedAt } }
    };
    await Submission.findByIdAndUpdate(submissionId, update);
    await this.updateUserStats(submission, verdict).catch((error) => {
      this.log("user_stats_update_failed", { submissionId, error: error.message });
    });

    const finalResult = {
      submissionId,
      problemId: submission.problemId,
      userId: String(submission.userId),
      language: submission.language,
      status: terminalStatus,
      verdict,
      statusText,
      passed,
      total: recordedTotal,
      compiler,
      execution,
      complexity,
      testResults: testResults.map(publicRealtimeTest),
      startTime: startedAt.toISOString(),
      endTime: endedAt.toISOString(),
      duration: endedAt.getTime() - startedAt.getTime()
    };
    monitoringService.recordExecution(executionTimeMs);
    this.log("execution_completed", {
      submissionId,
      jobId: jobContext.jobId,
      userId: String(submission.userId),
      language: submission.language,
      status: terminalStatus,
      verdict,
      startTime: startedAt.toISOString(),
      endTime: endedAt.toISOString(),
      duration: endedAt.getTime() - startedAt.getTime(),
      executionTimeMs,
      peakMemoryBytes,
      passed,
      total: recordedTotal
    });
    await this.broadcastRealtimeUpdate(finalResult);
    return finalResult;
  }

  async markSystemError(jobData, error) {
    if (!jobData?.submissionId) return;
    const completedAt = new Date();
    const updated = await Submission.findByIdAndUpdate(jobData.submissionId, {
      $set: {
        status: "SYSTEM_ERROR",
        verdict: "SYSTEM_ERROR",
        statusText: "System Error",
        errorMessage: String(error?.message || "Execution infrastructure failed after retries.").slice(0, 2000),
        completedAt
      },
      $push: { statusHistory: { status: "SYSTEM_ERROR", at: completedAt } }
    }, { new: true }).lean();
    await this.broadcastRealtimeUpdate({
      submissionId: String(jobData.submissionId),
      problemId: updated?.problemId,
      userId: updated?.userId ? String(updated.userId) : undefined,
      language: updated?.language,
      status: "SYSTEM_ERROR",
      verdict: "SYSTEM_ERROR",
      statusText: "System Error"
    });
  }

  async updateUserStats(submission, verdict) {
    if (submission.mode === "RUN" || !submission.userId) return;
    const userQuery = mongoose.Types.ObjectId.isValid(String(submission.userId))
      ? { $or: [{ _id: submission.userId }, { id: String(submission.userId) }] }
      : { id: String(submission.userId) };

    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const update = verdict === "AC"
      ? {
          $addToSet: {
            solvedProblemIds: submission.problemId,
            attemptedProblemIds: submission.problemId,
            activeDates: todayKey
          },
          $inc: { xp: 50, "stats.totalSubmissions": 1, "stats.acceptedSubmissions": 1 }
        }
      : {
          $addToSet: { attemptedProblemIds: submission.problemId },
          $inc: { "stats.totalSubmissions": 1 }
        };
    await User.findOneAndUpdate(userQuery, update);
  }

  async broadcastRealtimeUpdate(payload) {
    if (!process.env.REALTIME_SERVICE_URL || !process.env.REALTIME_INTERNAL_SECRET) return;
    try {
      const response = await fetch(`${process.env.REALTIME_SERVICE_URL}/api/realtime/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REALTIME_INTERNAL_SECRET}`
        },
        body: JSON.stringify({ event: "submission:update", payload })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      this.log("realtime_delivery_failed", { submissionId: payload.submissionId, error: error.message });
    }
  }
}

export const judgeWorker = new JudgeWorker();
export default judgeWorker;

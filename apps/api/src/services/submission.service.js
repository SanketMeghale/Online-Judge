import mongoose from "mongoose";
import { Submission } from "../models/Submission.js";
import { Problem } from "../models/Problem.js";
import { isDatabaseConnected } from "../lib/db.js";
import { createSubmissionRecord, updateSubmissionRecord, listSubmissionRecords } from "../lib/submissionStore.js";
import { calculateRealPercentile } from "../lib/benchmarkEngine.js";
import { wrapCodeWithHarness } from "../lib/codeHarness.js";
import { executeCode } from "../lib/executeCode.js";
import { problems as defaultProblems } from "../data/problems.js";
import { recordUserSubmission } from "../lib/userStore.js";
import { compareOutputs } from "../lib/outputChecker.js";
import { isValidLanguage, normalizeLanguage } from "@online-judge/shared";
import { publishSubmissionJob } from "../lib/submissionQueue.js";

function sanitizeTestResult(result = {}) {
  return {
    id: result.id,
    testCase: result.testCase ?? result.testcaseIndex,
    status: result.status,
    passed: Boolean(result.passed),
    verdict: result.verdict,
    execution_time_ms: result.execution_time_ms ?? result.runtimeMs ?? 0,
    memory_kb: result.memory_kb ?? 0
  };
}

function sanitizeSubmissionForUser(submission) {
  if (!submission) return null;
  const value = typeof submission.toObject === "function" ? submission.toObject() : submission;
  const { expectedOutput, stdin, stdout, stderr, output, compileOutput, testcases, testResults, __v, ...safe } = value;
  const rawResults = Array.isArray(testResults) && testResults.length > 0 ? testResults : testcases;
  return {
    ...safe,
    id: String(value.id || value._id || value.submissionId),
    submissionId: String(value.submissionId || value.id || value._id),
    diagnostic: value.verdict === "CE" ? String(compileOutput || stderr || "").slice(0, 16_000) : "",
    testResults: Array.isArray(rawResults) ? rawResults.map(sanitizeTestResult) : []
  };
}

async function loadProblem(problemId) {
  let problem = null;
  if (isDatabaseConnected()) {
    problem = await Problem.findOne({ id: String(problemId), isDeleted: { $ne: true }, status: "published" }).lean();
  }
  return problem || defaultProblems.find((item) => item.id === problemId) || null;
}

function cleanErrorMessage(stderr = "") {
  return stderr
    .replace(/C:\\Users\\[^\\]+\\AppData\\Local\\Temp\\/gi, "")
    .replace(/\/tmp\//g, "")
    .replace(/solution_[a-z0-9_]+\.(py|cpp|java|js|c)/gi, "Solution");
}

function buildCppJavaStdin(problemId, lcInput) {
  if (!lcInput || !lcInput.trim()) return "";
  const raw = lcInput.trim();
  const pid = (problemId || "").toLowerCase();

  try {
    if (pid === "two-sum") {
      const numsMatch = raw.match(/nums\s*=\s*(\[.*?\])/);
      const targetMatch = raw.match(/target\s*=\s*(-?\d+)/);
      if (numsMatch && targetMatch) {
        const nums = JSON.parse(numsMatch[1]);
        return `${nums.length}\n${nums.join(" ")}\n${targetMatch[1]}`;
      }
    }

    if (pid === "valid-parentheses") {
      const sMatch = raw.match(/s\s*=\s*"([^"]*)"/) || raw.match(/s\s*=\s*'([^']*)'/);
      if (sMatch) return sMatch[1];
    }

    if (pid === "palindrome-number") {
      const xMatch = raw.match(/x\s*=\s*(-?\d+)/);
      if (xMatch) return xMatch[1];
    }

    if (pid === "best-time-to-buy-and-sell-stock") {
      const pricesMatch = raw.match(/prices\s*=\s*(\[.*?\])/);
      if (pricesMatch) {
        const prices = JSON.parse(pricesMatch[1]);
        return `${prices.length}\n${prices.join(" ")}`;
      }
    }

    if (pid === "single-number") {
      const numsMatch = raw.match(/nums\s*=\s*(\[.*?\])/);
      if (numsMatch) {
        const nums = JSON.parse(numsMatch[1]);
        return `${nums.length}\n${nums.join(" ")}`;
      }
    }

    if (pid === "climbing-stairs") {
      const nMatch = raw.match(/n\s*=\s*(\d+)/);
      if (nMatch) return nMatch[1];
    }

    if (pid === "reverse-string") {
      const sMatch = raw.match(/s\s*=\s*(\[.*?\])/);
      if (sMatch) {
        const s = JSON.parse(sMatch[1]);
        return `${s.length}\n${s.join(" ")}`;
      }
    }
  } catch {}

  return raw;
}

async function evaluateSubmissionInline({ submission, problem }) {
  const { code, language } = submission;
  const sampleCases = problem?.examples || [];
  const hiddenCases = problem?.hiddenTestCases || [];
  const testCases = [...sampleCases, ...hiddenCases];
  const normLang = (language || "").toLowerCase().trim();
  const needsConvertedStdin = ["cpp", "c++", "java", "c"].includes(normLang);

  if (!testCases.length) {
    const result = await executeCode({ language: normLang, code });
    const cleanErr = cleanErrorMessage(result.stderr || result.compileOutput || "");
    const runtimeMs = result.execution_time_ms ?? result.runtimeMs ?? 0;
    const memoryKb = result.memory_kb ?? 0;
    const memoryMb = result.memoryMb ?? (memoryKb > 0 ? Number((memoryKb / 1024).toFixed(2)) : 0);

    const verdict = result.ok ? "AC" : (result.verdict === "CE" ? "CE" : result.verdict === "TLE" ? "TLE" : "RE");
    const percentiles = await calculateRealPercentile({
      problemId: problem?.id,
      language: normLang,
      runtimeMs,
      memoryMb
    });

    return {
      status: "COMPLETED",
      verdict,
      statusText: result.ok ? "Accepted" : verdict === "CE" ? "Compilation Error" : verdict === "TLE" ? "Time Limit Exceeded" : "Execution failed",
      runtimeMs,
      execution_time_ms: runtimeMs,
      compilation_time_ms: result.compilation_time_ms ?? 0,
      memory_kb: memoryKb,
      memoryMb,
      memory: memoryMb > 0 ? `${memoryMb} MB` : undefined,
      runtimePercentile: percentiles.runtimePercentile,
      memoryPercentile: percentiles.memoryPercentile,
      stdout: result.stdout || "",
      stderr: cleanErr,
      compileOutput: result.compileOutput || "",
      output: result.stdout || cleanErr,
      testResults: []
    };
  }

  const testResults = [];
  let totalRuntimeMs = 0;
  let maxMemoryKb = 0;
  let compilationTimeMs = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testcase = testCases[i];
    const tcStdin = needsConvertedStdin
      ? buildCppJavaStdin(problem?.id, testcase.input)
      : testcase.input;
    const wrappedCode = wrapCodeWithHarness({ code, language: normLang, problemId: problem?.id, stdin: tcStdin });
    const result = await executeCode({ language: normLang, code: wrappedCode, stdin: tcStdin });

    const execMs = result.execution_time_ms ?? result.runtimeMs ?? 0;
    totalRuntimeMs += execMs;
    compilationTimeMs = Math.max(compilationTimeMs, result.compilation_time_ms ?? 0);
    maxMemoryKb = Math.max(maxMemoryKb, result.memory_kb ?? 0);
    const cleanErr = cleanErrorMessage(result.stderr || result.compileOutput || "");

    // Compilation error on compiled languages
    if (result.verdict === "CE") {
      testResults.push({
        id: i + 1,
        testCase: i + 1,
        status: "COMPILATION_ERROR",
        passed: false,
        input: testcase.input,
        expectedOutput: testcase.output,
        actualOutput: cleanErr || "Compilation Error",
        difference: "Compilation failed.",
        verdict: "CE",
        execution_time_ms: 0,
        memory_kb: 0,
        stdout: "",
        stderr: cleanErr
      });

      return {
        status: "COMPLETED",
        verdict: "CE",
        statusText: "Compilation Error",
        passedCount: 0,
        totalCases: testCases.length,
        runtimeMs: 0,
        execution_time_ms: 0,
        compilation_time_ms: compilationTimeMs,
        memory_kb: 0,
        memoryMb: 0,
        runtimePercentile: null,
        memoryPercentile: null,
        stdout: "",
        stderr: cleanErr,
        compileOutput: cleanErr,
        output: cleanErr || "Compilation Error",
        expectedOutput: testcase.output,
        testResults
      };
    }

    if (!result.ok) {
      const verdict = result.verdict || "RE";
      const avgRuntimeMs = Number((totalRuntimeMs / (i + 1)).toFixed(2));
      const memoryMb = maxMemoryKb > 0 ? Number((maxMemoryKb / 1024).toFixed(2)) : 0;

      testResults.push({
        id: i + 1,
        testCase: i + 1,
        status: verdict === "TLE" ? "TIME_LIMIT_EXCEEDED" : "RUNTIME_ERROR",
        passed: false,
        input: testcase.input,
        expectedOutput: testcase.output,
        actualOutput: result.stdout || cleanErr || "(No output)",
        difference: cleanErr || (verdict === "TLE" ? "Time Limit Exceeded" : "Runtime Error"),
        verdict,
        execution_time_ms: execMs,
        memory_kb: result.memory_kb ?? 0,
        stdout: result.stdout || "",
        stderr: cleanErr
      });

      return {
        status: "COMPLETED",
        verdict,
        statusText: verdict === "TLE" ? "Time Limit Exceeded" : `Runtime Error on testcase ${i + 1}`,
        passedCount: i,
        totalCases: testCases.length,
        runtimeMs: avgRuntimeMs,
        execution_time_ms: avgRuntimeMs,
        compilation_time_ms: compilationTimeMs,
        memory_kb: maxMemoryKb,
        memoryMb,
        memory: memoryMb > 0 ? `${memoryMb} MB` : undefined,
        runtimePercentile: null,
        memoryPercentile: null,
        stdout: result.stdout || "",
        stderr: cleanErr,
        output: result.stdout || cleanErr || "Execution failed",
        expectedOutput: testcase.output,
        testResults
      };
    }

    const comparison = compareOutputs(result.stdout, testcase.output);
    testResults.push({
      id: i + 1,
      testCase: i + 1,
      status: comparison.passed ? "PASSED" : "WRONG_ANSWER",
      passed: comparison.passed,
      input: testcase.input,
      expectedOutput: testcase.output,
      actualOutput: result.stdout.trim() || "(No output)",
      difference: comparison.difference,
      verdict: comparison.passed ? "AC" : "WA",
      execution_time_ms: execMs,
      memory_kb: result.memory_kb ?? 0,
      stdout: result.stdout || "",
      stderr: cleanErrorMessage(result.stderr)
    });

    if (!comparison.passed) {
      const avgRuntimeMs = Number((totalRuntimeMs / (i + 1)).toFixed(2));
      const memoryMb = maxMemoryKb > 0 ? Number((maxMemoryKb / 1024).toFixed(2)) : 0;

      return {
        status: "COMPLETED",
        verdict: "WA",
        statusText: `Wrong Answer on testcase ${i + 1} / ${testCases.length}`,
        passedCount: i,
        totalCases: testCases.length,
        runtimeMs: avgRuntimeMs,
        execution_time_ms: avgRuntimeMs,
        compilation_time_ms: compilationTimeMs,
        memory_kb: maxMemoryKb,
        memoryMb,
        memory: memoryMb > 0 ? `${memoryMb} MB` : undefined,
        runtimePercentile: null,
        memoryPercentile: null,
        stdout: result.stdout || "",
        stderr: cleanErrorMessage(result.stderr),
        output: result.stdout.trim() || "Incorrect output",
        expectedOutput: testcase.output,
        testResults
      };
    }
  }

  const avgRuntimeMs = Number((totalRuntimeMs / testCases.length).toFixed(2));
  const memoryMb = maxMemoryKb > 0 ? Number((maxMemoryKb / 1024).toFixed(2)) : 0;

  const percentiles = await calculateRealPercentile({
    problemId: problem?.id,
    language: normLang,
    runtimeMs: avgRuntimeMs,
    memoryMb
  });

  return {
    status: "COMPLETED",
    verdict: "AC",
    statusText: "Accepted",
    passedCount: testCases.length,
    totalCases: testCases.length,
    runtimeMs: avgRuntimeMs,
    execution_time_ms: avgRuntimeMs,
    compilation_time_ms: compilationTimeMs,
    memory_kb: maxMemoryKb,
    memoryMb,
    memory: memoryMb > 0 ? `${memoryMb} MB` : undefined,
    runtimePercentile: percentiles.runtimePercentile,
    memoryPercentile: percentiles.memoryPercentile,
    stdout: testResults[0]?.actualOutput || "",
    stderr: "",
    output: testResults[0]?.actualOutput || testCases[0]?.output || "Success",
    expectedOutput: testCases[0]?.output ?? "",
    testResults
  };
}

/**
 * SubmissionService - Coordinates Submission Queuing and Lifecycle
 */
export class SubmissionService {
  async submitCode({ userId, problemId, language, code }) {
    if (!problemId || !language || !code) {
      throw new Error("Missing required parameters for submission.");
    }

    const cleanLanguage = normalizeLanguage(language);
    if (!isValidLanguage(cleanLanguage)) {
      const error = new Error("Unsupported programming language.");
      error.statusCode = 400;
      throw error;
    }
    if (String(code).length > 100_000) {
      const error = new Error("Source code exceeds the 100 KB submission limit.");
      error.statusCode = 413;
      throw error;
    }

    const problem = await loadProblem(problemId);
    if (!problem) {
      const error = new Error("Problem not found or unavailable for submissions.");
      error.statusCode = 404;
      throw error;
    }

    // 1. Save Initial Submission Record
    const submissionData = {
      userId,
      problemId,
      language: cleanLanguage,
      code,
      status: "QUEUED",
      verdict: "PENDING",
      statusText: "Queued for evaluation",
      passCount: 0,
      totalCount: 0,
      runtimeMs: 0,
      memoryMb: 0,
      createdAt: new Date()
    };

    const newSubmission = await createSubmissionRecord(submissionData);
    const submissionId = String(newSubmission._id || newSubmission.id || newSubmission.submissionId);
    console.log(`[SubmissionService] [STAGE 2: CODE_SAVED] Saved submission ID: ${submissionId}`);

    // 2. Attempt publishing job to RabbitMQ queue
    const jobPayload = {
      submissionId,
      problemId,
      userId,
      language: cleanLanguage,
      code
    };

    let published = false;
    try {
      published = await publishSubmissionJob(jobPayload);
    } catch (e) {
      published = false;
    }

    if (published) {
      console.log(`[SubmissionService] [STAGE 3: JOB_QUEUED] Published job ${submissionId} to RabbitMQ.`);
      return sanitizeSubmissionForUser({
        id: submissionId,
        submissionId,
        problemId,
        userId,
        language: cleanLanguage,
        status: "QUEUED",
        verdict: "PENDING",
        statusText: "Queued for evaluation",
        createdAt: newSubmission.createdAt || new Date()
      });
    }

    const inlineJudgeAllowed = process.env.ALLOW_INLINE_JUDGE === "true" && process.env.NODE_ENV !== "production";
    if (!inlineJudgeAllowed) {
      await updateSubmissionRecord(submissionId, {
        status: "SYSTEM_ERROR",
        verdict: "SYSTEM_ERROR",
        statusText: "Judge queue unavailable",
        completedAt: new Date()
      });
      const error = new Error("The judge queue is currently unavailable. Please retry shortly.");
      error.statusCode = 503;
      throw error;
    }

    console.warn(`[SubmissionService] RabbitMQ offline. Using explicitly enabled development inline judge for ${submissionId}.`);

    const evaluation = await evaluateSubmissionInline({
      submission: { id: submissionId, language: cleanLanguage, code },
      problem
    });

    const updatedRecord = {
      status: "COMPLETED",
      verdict: evaluation.verdict,
      statusText: evaluation.statusText,
      passCount: evaluation.passedCount ?? evaluation.passCount ?? 0,
      totalCount: evaluation.totalCases ?? evaluation.totalCount ?? 0,
      passedCount: evaluation.passedCount ?? evaluation.passCount ?? 0,
      totalCases: evaluation.totalCases ?? evaluation.totalCount ?? 0,
      runtimeMs: evaluation.runtimeMs || 0,
      execution_time_ms: evaluation.execution_time_ms || 0,
      compilation_time_ms: evaluation.compilation_time_ms || 0,
      memory_kb: evaluation.memory_kb || 0,
      memoryMb: evaluation.memoryMb || 0,
      runtimePercentile: evaluation.runtimePercentile,
      memoryPercentile: evaluation.memoryPercentile,
      stdout: evaluation.stdout || "",
      stderr: evaluation.stderr || "",
      output: evaluation.output || evaluation.stdout || "",
      testcases: evaluation.testResults || evaluation.testcases || [],
      completedAt: new Date()
    };

    await updateSubmissionRecord(submissionId, updatedRecord);

    // Update user stats in DB
    try {
      await recordUserSubmission(userId, problemId, evaluation.verdict, problem?.points || 10);
    } catch (userErr) {
      console.warn("[SubmissionService] Notice: could not update user stats:", userErr.message);
    }

    console.log(`[SubmissionService] [STAGE 9: DATABASE_UPDATED] Submission ${submissionId} evaluation complete: ${evaluation.verdict} (${evaluation.statusText})`);

    return sanitizeSubmissionForUser({
      id: submissionId,
      submissionId,
      problemId,
      userId,
      language: cleanLanguage,
      status: "COMPLETED",
      verdict: evaluation.verdict,
      statusText: evaluation.statusText,
      passCount: updatedRecord.passCount,
      passedCount: updatedRecord.passCount,
      totalCount: updatedRecord.totalCount,
      totalCases: updatedRecord.totalCount,
      runtimeMs: updatedRecord.runtimeMs,
      execution_time_ms: updatedRecord.execution_time_ms,
      compilation_time_ms: updatedRecord.compilation_time_ms,
      runtime: `${updatedRecord.runtimeMs} ms`,
      memory_kb: updatedRecord.memory_kb,
      memoryMb: updatedRecord.memoryMb,
      memory: updatedRecord.memoryMb > 0 ? `${updatedRecord.memoryMb} MB` : undefined,
      runtimePercentile: evaluation.runtimePercentile,
      memoryPercentile: evaluation.memoryPercentile,
      stdout: updatedRecord.stdout,
      stderr: updatedRecord.stderr,
      output: updatedRecord.output,
      testResults: updatedRecord.testcases,
      createdAt: newSubmission.createdAt || new Date(),
      completedAt: updatedRecord.completedAt
    });
  }

  async getSubmissionById(id, requestingUser) {
    let submission = null;
    if (isDatabaseConnected()) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          const doc = await Submission.findById(id).lean();
          if (doc) submission = doc;
        }
        if (!submission) {
          submission = await Submission.findOne({
            $or: [{ submissionId: id }, { id }]
          }).lean();
        }
      } catch (err) {
        console.warn(`[SubmissionService] MongoDB find error for ${id}:`, err.message);
      }
    }

    if (!submission) {
      const records = await listSubmissionRecords({});
      submission = records.find((r) => String(r._id || r.id || r.submissionId) === String(id)) || null;
    }

    if (!submission) return null;
    const requesterIds = [requestingUser?.id, requestingUser?._id].filter(Boolean).map(String);
    const isAdmin = requestingUser?.role === "admin" || requestingUser?.role === "super_admin";
    if (!isAdmin && !requesterIds.includes(String(submission.userId))) return null;
    return sanitizeSubmissionForUser(submission);
  }

  async getUserSubmissionHistory({ userId, problemId, verdict, language, limit = 50, page = 1 }) {
    const userIds = (Array.isArray(userId) ? userId : [userId]).filter(Boolean).map(String);
    const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
    const safePage = Math.max(1, Number(page) || 1);
    const filter = { userId: { $in: userIds } };
    if (problemId) filter.problemId = String(problemId);
    if (verdict) filter.verdict = String(verdict).toUpperCase();
    if (language) filter.language = String(language).toLowerCase();

    let records;
    let total;
    if (isDatabaseConnected()) {
      [records, total] = await Promise.all([
        Submission.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
        Submission.countDocuments(filter)
      ]);
    } else {
      const all = (await listSubmissionRecords({})).filter((item) => {
        return userIds.includes(String(item.userId)) &&
          (!problemId || String(item.problemId) === String(problemId)) &&
          (!verdict || String(item.verdict).toUpperCase() === String(verdict).toUpperCase()) &&
          (!language || String(item.language).toLowerCase() === String(language).toLowerCase());
      });
      total = all.length;
      records = all.slice((safePage - 1) * safeLimit, safePage * safeLimit);
    }

    return {
      submissions: records.map(sanitizeSubmissionForUser),
      pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) }
    };
  }

  async getSubmissions(query = {}) {
    if (isDatabaseConnected()) {
      try {
        const filter = {};
        if (query.userId) filter.userId = query.userId;
        if (query.problemId) filter.problemId = query.problemId;
        if (query.language) filter.language = query.language.toLowerCase();
        if (query.verdict) filter.verdict = query.verdict;

        const docs = await Submission.find(filter)
          .sort({ createdAt: -1 })
          .limit(Number(query.limit) || 50)
          .lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn("[SubmissionService] MongoDB getSubmissions error:", err.message);
      }
    }

    return listSubmissionRecords(query);
  }
}

export const submissionService = new SubmissionService();

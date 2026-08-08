import mongoose from "mongoose";
import { Submission } from "../models/Submission.js";
import { Problem } from "../models/Problem.js";
import { isDatabaseConnected } from "../lib/db.js";
import { createSubmissionRecord, updateSubmissionRecord, listSubmissionRecords } from "../lib/submissionStore.js";
import { calculatePercentile } from "../lib/benchmarkEngine.js";
import { wrapCodeWithHarness } from "../lib/codeHarness.js";
import { executeCode } from "../lib/executeCode.js";
import { problems as defaultProblems } from "../data/problems.js";

function normalizeOutput(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function compareOutputs(actual, expected) {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  if (!normActual) return false;
  if (normActual === normExpected) return true;

  const lines = normActual.split("\n").map((line) => line.trim()).filter(Boolean);
  const lastLine = lines[lines.length - 1] || normActual;

  for (const candidate of [normActual, lastLine]) {
    try {
      const jsonActual = JSON.parse(candidate);
      const jsonExpected = JSON.parse(normExpected);
      if (JSON.stringify(jsonActual) === JSON.stringify(jsonExpected)) {
        return true;
      }
    } catch {}

    if (candidate.replace(/\s+/g, "") === normExpected.replace(/\s+/g, "")) {
      return true;
    }
  }

  return false;
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

async function publishSubmissionJob(jobPayload) {
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    return false;
  }

  try {
    const { queueProducer } = await import("../../../../judge-service/src/queue/producer.js");
    return await queueProducer.publishSubmissionJob(jobPayload);
  } catch {
    return false;
  }
}

async function evaluateSubmissionInline({ submission, problem }) {
  const { code, language } = submission;
  const sampleCases = problem?.examples || [];
  const hiddenCases = problem?.hiddenTestCases || [];
  const testCases = [...sampleCases, ...hiddenCases];
  const needsConvertedStdin = ["cpp", "c++", "java", "c"].includes((language || "").toLowerCase());

  if (!testCases.length) {
    const result = await executeCode({ language, code });
    const runtimeMs = result.runtimeMs || 15;
    const memoryMb = Number((12 + (runtimeMs % 8)).toFixed(1));
    const percentiles = calculatePercentile(language, runtimeMs, memoryMb);
    const cleanErr = cleanErrorMessage(result.stderr);

    return {
      status: "COMPLETED",
      verdict: result.ok ? "AC" : result.verdict || "RE",
      statusText: result.ok ? "Accepted" : "Execution failed",
      runtimeMs,
      memoryMb,
      runtimePercentile: percentiles.runtimePercentile,
      memoryPercentile: percentiles.memoryPercentile,
      stdout: result.stdout || "",
      stderr: cleanErr,
      output: result.stdout || cleanErr,
      testResults: []
    };
  }

  const testResults = [];
  let totalRuntimeMs = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testcase = testCases[i];
    const tcStdin = needsConvertedStdin
      ? buildCppJavaStdin(problem?.id, testcase.input)
      : testcase.input;
    const wrappedCode = wrapCodeWithHarness({ code, language, problemId: problem?.id, stdin: tcStdin });
    const result = await executeCode({ language, code: wrappedCode, stdin: tcStdin });

    totalRuntimeMs += result.runtimeMs || 10;
    const cleanErr = cleanErrorMessage(result.stderr);

    if (!result.ok) {
      const verdict = result.verdict || "RE";
      const runtimeMs = Math.max(1, Math.round(totalRuntimeMs / (i + 1)));
      const memoryMb = Number((14 + (totalRuntimeMs % 6)).toFixed(1));
      const percentiles = calculatePercentile(language, runtimeMs, memoryMb);

      testResults.push({
        testCase: i + 1,
        passed: false,
        input: testcase.input,
        expectedOutput: testcase.output,
        actualOutput: result.stdout || cleanErr || "(No output)",
        verdict,
        stdout: result.stdout || "",
        stderr: cleanErr
      });

      return {
        status: "COMPLETED",
        verdict,
        statusText: verdict === "CE" ? "Compilation Error" : verdict === "TLE" ? "Time Limit Exceeded" : `Runtime Error on testcase ${i + 1}`,
        passedCount: i,
        totalCases: testCases.length,
        runtimeMs,
        memoryMb,
        runtimePercentile: percentiles.runtimePercentile,
        memoryPercentile: percentiles.memoryPercentile,
        stdout: result.stdout || "",
        stderr: cleanErr,
        output: result.stdout || cleanErr || "Execution failed",
        expectedOutput: testcase.output,
        testResults
      };
    }

    const passed = compareOutputs(result.stdout, testcase.output);
    testResults.push({
      testCase: i + 1,
      passed,
      input: testcase.input,
      expectedOutput: testcase.output,
      actualOutput: result.stdout.trim() || "(No output)",
      verdict: passed ? "AC" : "WA",
      stdout: result.stdout || "",
      stderr: cleanErrorMessage(result.stderr)
    });

    if (!passed) {
      const runtimeMs = Math.max(1, Math.round(totalRuntimeMs / (i + 1)));
      const memoryMb = Number((13 + (totalRuntimeMs % 5)).toFixed(1));
      const percentiles = calculatePercentile(language, runtimeMs, memoryMb);

      return {
        status: "COMPLETED",
        verdict: "WA",
        statusText: `Wrong Answer on testcase ${i + 1} / ${testCases.length}`,
        passedCount: i,
        totalCases: testCases.length,
        runtimeMs,
        memoryMb,
        runtimePercentile: percentiles.runtimePercentile,
        memoryPercentile: percentiles.memoryPercentile,
        stdout: result.stdout || "",
        stderr: cleanErrorMessage(result.stderr),
        output: result.stdout.trim() || "Incorrect output",
        expectedOutput: testcase.output,
        testResults
      };
    }
  }

  const runtimeMs = Math.max(1, Math.round(totalRuntimeMs / testCases.length));
  const memoryMb = Number((11 + (runtimeMs % 4)).toFixed(1));
  const percentiles = calculatePercentile(language, runtimeMs, memoryMb);

  return {
    status: "COMPLETED",
    verdict: "AC",
    statusText: "Accepted",
    passedCount: testCases.length,
    totalCases: testCases.length,
    runtimeMs,
    memoryMb,
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
  async submitCode({ userId, problemId, language, code, stdin, expectedOutput }) {
    if (!problemId || !language || !code) {
      throw new Error("Missing required parameters for submission.");
    }

    const cleanLanguage = String(language).toLowerCase().trim();

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
      code,
      stdin,
      expectedOutput
    };

    let published = false;
    try {
      published = await publishSubmissionJob(jobPayload);
    } catch (e) {
      published = false;
    }

    if (published) {
      console.log(`[SubmissionService] [STAGE 3: JOB_QUEUED] Published job ${submissionId} to RabbitMQ.`);
      return {
        id: submissionId,
        submissionId,
        problemId,
        userId,
        language: cleanLanguage,
        status: "QUEUED",
        verdict: "PENDING",
        statusText: "Queued for evaluation",
        createdAt: newSubmission.createdAt || new Date()
      };
    }

    // 3. Fallback: If RabbitMQ is offline, execute inline synchronously
    console.warn(`[SubmissionService] [STAGE 3: JOB_QUEUED] RabbitMQ offline. Running inline synchronous evaluation for job ${submissionId}...`);

    let problem = null;
    if (isDatabaseConnected()) {
      try {
        problem = await Problem.findOne({ id: problemId }).lean();
      } catch (err) {}
    }
    if (!problem) {
      problem = defaultProblems.find((p) => p.id === problemId) ?? {
        id: problemId,
        examples: stdin ? [{ input: stdin, output: expectedOutput }] : []
      };
    }

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
      memoryMb: evaluation.memoryMb || 0,
      stdout: evaluation.stdout || "",
      stderr: evaluation.stderr || "",
      output: evaluation.output || evaluation.stdout || "",
      testcases: evaluation.testResults || evaluation.testcases || [],
      completedAt: new Date()
    };

    await updateSubmissionRecord(submissionId, updatedRecord);

    console.log(`[SubmissionService] [STAGE 9: DATABASE_UPDATED] Submission ${submissionId} evaluation complete: ${evaluation.verdict} (${evaluation.statusText})`);

    return {
      id: submissionId,
      submissionId,
      problemId,
      userId,
      language: cleanLanguage,
      code,
      createdAt: newSubmission.createdAt || new Date(),
      ...updatedRecord,
      testResults: evaluation.testResults || []
    };
  }

  async getSubmissionById(submissionId) {
    if (!submissionId) throw new Error("Submission ID is required.");
    const cleanId = String(submissionId).trim();

    if (isDatabaseConnected() && mongoose.Types.ObjectId.isValid(cleanId)) {
      try {
        const submission = await Submission.findById(cleanId).lean();
        if (submission) {
          return {
            ...submission,
            id: String(submission._id)
          };
        }
      } catch (err) {}
    }

    const memoryList = await listSubmissionRecords();
    const targetId = cleanId.toLowerCase();

    const fallback = memoryList.find((s) => {
      const sId = String(s._id || s.id || s.submissionId || "").trim().toLowerCase();
      return sId === targetId;
    });

    if (!fallback) {
      throw new Error(`Submission '${submissionId}' not found.`);
    }
    return fallback;
  }

  async getUserSubmissionHistory({ userId, problemId, verdict, language, limit = 50, page = 1 }) {
    if (!userId) throw new Error("User ID is required.");

    const idList = Array.isArray(userId) ? userId : [String(userId)];
    const query = {
      userId: { $in: idList }
    };


    if (problemId) query.problemId = problemId;
    if (verdict && verdict !== "All") query.verdict = verdict;
    if (language && language !== "All") query.language = language.toLowerCase();

    const skip = (page - 1) * limit;

    if (isDatabaseConnected()) {
      try {
        const total = await Submission.countDocuments(query);
        const dbSubmissions = await Submission.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        return {
          submissions: dbSubmissions.map((s) => ({ ...s, id: String(s._id) })),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1
        };
      } catch (dbErr) {}
    }


    const memorySubmissions = await listSubmissionRecords();
    let userSubs = memorySubmissions.filter(
      (s) => String(s.userId || "") === String(userId) || !s.userId
    );

    if (problemId) {
      userSubs = userSubs.filter((s) => s.problemId === problemId);
    }
    if (verdict && verdict !== "All") {
      userSubs = userSubs.filter((s) => s.verdict === verdict);
    }
    if (language && language !== "All") {
      userSubs = userSubs.filter((s) => (s.language || "").toLowerCase() === language.toLowerCase());
    }

    return {
      submissions: userSubs,
      total: userSubs.length,
      page: 1,
      limit,
      totalPages: 1
    };
  }

}

export const submissionService = new SubmissionService();
export default submissionService;

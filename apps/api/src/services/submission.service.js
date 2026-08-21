import mongoose from "mongoose";
import { ACTIVE_SUBMISSION_STATUSES, isValidLanguage, normalizeLanguage } from "@online-judge/shared";
import { Submission } from "../models/Submission.js";
import { Problem } from "../models/Problem.js";
import { connectDatabase, isDatabaseConnected } from "../lib/db.js";
import {
  createSubmissionRecord,
  updateSubmissionRecord,
  listSubmissionRecords
} from "../lib/submissionStore.js";
import { problems as defaultProblems } from "../data/problems.js";
import { publishSubmissionJob } from "../lib/submissionQueue.js";

const TERMINAL_VERDICTS = new Set(["AC", "WA", "RE", "TLE", "MLE", "CE", "SYSTEM_ERROR"]);

function publicTestResult(result = {}, allowDetails = false) {
  const safe = {
    id: result.id,
    number: result.number ?? result.testCase ?? result.testcaseIndex,
    status: result.status,
    passed: Boolean(result.passed),
    verdict: result.verdict,
    executionTimeMs: result.executionTimeMs ?? result.execution_time_ms ?? result.runtimeMs ?? 0,
    peakMemoryBytes: result.peakMemoryBytes ?? 0,
    visibility: result.visibility === "PUBLIC" ? "PUBLIC" : "HIDDEN"
  };

  if (allowDetails && safe.visibility !== "HIDDEN") {
    safe.input = result.input ?? "";
    safe.expectedOutput = result.expectedOutput ?? "";
    safe.actualOutput = result.actualOutput ?? result.stdout ?? "";
    safe.stdout = result.stdout ?? result.actualOutput ?? "";
    safe.stderr = result.stderr ?? "";
    safe.difference = result.difference ?? "";
  }
  return safe;
}

export function sanitizeSubmissionForUser(submission) {
  if (!submission) return null;
  const value = typeof submission.toObject === "function" ? submission.toObject() : submission;
  const {
    stdin,
    customInput,
    expectedOutput,
    stdout,
    stderr,
    output,
    compileOutput,
    errorMessage,
    testcases,
    testResults,
    __v,
    ...safe
  } = value;
  const rawResults = Array.isArray(testResults) && testResults.length ? testResults : testcases;
  const mode = value.mode || "SUBMIT";
  const isCompilationError = value.verdict === "CE" || value.status === "COMPILATION_ERROR";
  const peakMemoryBytes = Number(value.peakMemoryBytes || value.execution?.peakMemoryBytes || 0);
  const executionTimeMs = Number(value.executionTimeMs ?? value.runtimeMs ?? value.execution?.timeMs ?? 0);

  return {
    ...safe,
    id: String(value.id || value._id || value.submissionId),
    submissionId: String(value.submissionId || value.id || value._id),
    mode,
    compiler: value.compiler || null,
    execution: isCompilationError ? null : value.execution || null,
    executionTimeMs,
    runtimeMs: executionTimeMs,
    execution_time_ms: executionTimeMs,
    peakMemoryBytes,
    memoryMb: peakMemoryBytes > 0 ? Number((peakMemoryBytes / 1024 / 1024).toFixed(2)) : 0,
    complexity: value.complexity || {
      time: "Unable to determine reliably",
      space: "Unable to determine reliably",
      confidence: "Low",
      explanation: "Static analysis has not completed yet."
    },
    diagnostic: isCompilationError
      ? String(value.compiler?.stderr || compileOutput || stderr || "").slice(0, 16_000)
      : "",
    testResults: Array.isArray(rawResults)
      ? rawResults.map((result) => publicTestResult(result, mode === "RUN" || result.visibility !== "HIDDEN"))
      : []
  };
}

async function loadProblem(problemId) {
  let problem = null;
  if (isDatabaseConnected()) {
    problem = await Problem.findOne({
      id: String(problemId),
      isDeleted: { $ne: true },
      status: "published"
    }).lean();
  }
  return problem || defaultProblems.find((item) => item.id === String(problemId)) || null;
}

function sourceLimitBytes() {
  return Math.max(1024, Number(process.env.MAX_SOURCE_SIZE_BYTES || 100_000));
}

async function assertUserCapacity(userId) {
  const maxConcurrent = Math.max(1, Number(process.env.MAX_CONCURRENT_JOBS_PER_USER || 3));
  if (!isDatabaseConnected()) return;
  const active = await Submission.countDocuments({
    userId: String(userId),
    status: { $in: ACTIVE_SUBMISSION_STATUSES }
  });
  if (active >= maxConcurrent) {
    const error = new Error(`You already have ${active} active execution jobs. Please wait for one to finish.`);
    error.statusCode = 429;
    throw error;
  }
}

function validateSource({ problemId, language, code }) {
  if (!problemId || !language || typeof code !== "string" || !code.trim()) {
    const error = new Error("problemId, language, and non-empty code are required.");
    error.statusCode = 400;
    throw error;
  }
  const normalizedLanguage = normalizeLanguage(language);
  if (!isValidLanguage(normalizedLanguage)) {
    const error = new Error("Unsupported programming language.");
    error.statusCode = 400;
    throw error;
  }
  if (Buffer.byteLength(code, "utf8") > sourceLimitBytes()) {
    const error = new Error(`Source code exceeds the ${sourceLimitBytes()} byte limit.`);
    error.statusCode = 413;
    throw error;
  }
  return normalizedLanguage;
}

async function enqueueExecution({ userId, problemId, language, code, mode, customInput = "" }) {
  const cleanLanguage = validateSource({ problemId, language, code });
  const databaseAvailable = await connectDatabase();
  if (!databaseAvailable && (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV)) {
    const error = new Error("Submission storage is temporarily unavailable.");
    error.statusCode = 503;
    throw error;
  }
  const maxInputBytes = Math.max(1024, Number(process.env.MAX_CUSTOM_INPUT_SIZE_BYTES || 64_000));
  if (Buffer.byteLength(String(customInput), "utf8") > maxInputBytes) {
    const error = new Error(`Custom input exceeds the ${maxInputBytes} byte limit.`);
    error.statusCode = 413;
    throw error;
  }

  const problem = await loadProblem(problemId);
  if (!problem) {
    const error = new Error("Problem not found or unavailable for execution.");
    error.statusCode = 404;
    throw error;
  }
  await assertUserCapacity(userId);

  const now = new Date();
  const record = await createSubmissionRecord({
    userId: String(userId),
    problemId: String(problemId),
    problemTitle: problem.title || "",
    language: cleanLanguage,
    code,
    sourceCode: code,
    mode,
    customInput: String(customInput || ""),
    status: "QUEUED",
    verdict: "PENDING",
    statusText: "Queued...",
    statusHistory: [{ status: "QUEUED", at: now }],
    passCount: 0,
    totalCount: 0,
    submittedAt: now
  });
  const submissionId = String(record._id || record.id || record.submissionId);

  try {
    const job = await publishSubmissionJob({ submissionId });
    await updateSubmissionRecord(submissionId, { jobId: job.id });
    return sanitizeSubmissionForUser({ ...record, id: submissionId, submissionId, jobId: job.id });
  } catch (cause) {
    await updateSubmissionRecord(submissionId, {
      status: "SYSTEM_ERROR",
      verdict: "SYSTEM_ERROR",
      statusText: "Execution queue unavailable",
      errorMessage: "The execution queue could not accept this job.",
      statusHistory: [
        { status: "QUEUED", at: now },
        { status: "SYSTEM_ERROR", at: new Date() }
      ],
      completedAt: new Date()
    });
    const error = new Error("The execution queue is currently unavailable. Please retry shortly.", { cause });
    error.statusCode = 503;
    throw error;
  }
}

export class SubmissionService {
  async submitCode({ userId, problemId, language, code }) {
    return enqueueExecution({ userId, problemId, language, code, mode: "SUBMIT" });
  }

  async runCode({ userId, problemId, language, code, stdin = "" }) {
    return enqueueExecution({
      userId,
      problemId,
      language,
      code,
      mode: "RUN",
      customInput: stdin
    });
  }

  async getSubmissionById(id, requestingUser) {
    let submission = null;
    if (isDatabaseConnected()) {
      const idString = String(id);
      const identityQueries = [{ id: idString }, { submissionId: idString }];
      if (mongoose.Types.ObjectId.isValid(idString)) identityQueries.unshift({ _id: idString });
      submission = await Submission.findOne({ $or: identityQueries }).lean();
    }
    if (!submission) {
      const records = await listSubmissionRecords({});
      submission = records.find((item) =>
        [item._id, item.id, item.submissionId].some((candidate) => String(candidate) === String(id))
      ) || null;
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
    const filter = { userId: { $in: userIds }, mode: { $ne: "RUN" } };
    if (problemId) filter.problemId = String(problemId);
    if (verdict) filter.verdict = String(verdict).toUpperCase();
    if (language) filter.language = normalizeLanguage(language);

    let records;
    let total;
    if (isDatabaseConnected()) {
      [records, total] = await Promise.all([
        Submission.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
        Submission.countDocuments(filter)
      ]);
    } else {
      const all = (await listSubmissionRecords({})).filter((item) =>
        userIds.includes(String(item.userId)) &&
        (item.mode || "SUBMIT") !== "RUN" &&
        (!problemId || String(item.problemId) === String(problemId)) &&
        (!verdict || String(item.verdict).toUpperCase() === String(verdict).toUpperCase()) &&
        (!language || normalizeLanguage(item.language) === normalizeLanguage(language))
      );
      total = all.length;
      records = all.slice((safePage - 1) * safeLimit, safePage * safeLimit);
    }
    return {
      submissions: records.map(sanitizeSubmissionForUser),
      pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) }
    };
  }

  async getSubmissions(query = {}) {
    const records = await listSubmissionRecords(query);
    return records.map(sanitizeSubmissionForUser);
  }

  isTerminal(submission) {
    return TERMINAL_VERDICTS.has(submission?.verdict);
  }
}

export const submissionService = new SubmissionService();

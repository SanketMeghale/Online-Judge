import mongoose from "mongoose";
import { Submission } from "../models/Submission.js";
import { Problem } from "../models/Problem.js";
import { isDatabaseConnected } from "../lib/db.js";
import { createSubmissionRecord, updateSubmissionRecord, listSubmissionRecords } from "../lib/submissionStore.js";
import { queueProducer } from "../../../../judge-service/src/queue/producer.js";
import { evaluateSubmission } from "../../../../services/judge-worker/src/judgeEvaluator.js";
import { problems as defaultProblems } from "../data/problems.js";

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
      published = await queueProducer.publishSubmissionJob(jobPayload);
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

    const evaluation = await evaluateSubmission({
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

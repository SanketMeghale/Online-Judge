import { Router } from "express";
import { evaluateSubmission } from "../../../../services/judge-worker/src/judgeEvaluator.js";
import { problems } from "../data/problems.js";
import { isDatabaseConnected } from "../lib/db.js";
import { broadcastEvent } from "../lib/realtimePublisher.js";
import { createSubmissionRecord, listSubmissionRecords } from "../lib/submissionStore.js";
import { optionalAuth } from "../middleware/authMiddleware.js";
import { Problem } from "../models/Problem.js";

const router = Router();

router.get("/", async (_request, response) => {
  const submissions = await listSubmissionRecords();
  response.json({ submissions });
});

router.post("/", optionalAuth, async (request, response) => {
  const { problemId = null, language, code, stdin = "", timeoutMs } = request.body ?? {};

  if (!language || !code) {
    response.status(400).json({ error: "Both 'language' and 'code' are required." });
    return;
  }

  let problem = null;

  if (isDatabaseConnected()) {
    try {
      problem = await Problem.findOne({ id: problemId }).lean();
    } catch {}
  }

  if (!problem) {
    problem = problems.find((p) => p.id === problemId) ?? {
      id: problemId,
      examples: stdin ? [{ input: stdin, output: "" }] : []
    };
  }

  const evaluation = await evaluateSubmission({
    submission: { language, code },
    problem
  });

  const submission = await createSubmissionRecord({
    userId: request.user?.id || "u-guest",
    problemId,
    language,
    stdin,
    status: "COMPLETED",
    verdict: evaluation.verdict,
    statusText: evaluation.statusText,
    runtimeMs: evaluation.runtimeMs,
    memoryMb: evaluation.memoryMb,
    runtimePercentile: evaluation.runtimePercentile,
    memoryPercentile: evaluation.memoryPercentile,
    passedCount: evaluation.passedCount,
    totalCases: evaluation.totalCases,
    stdout: evaluation.stdout || evaluation.output || "",
    stderr: evaluation.stderr || ""
  });


  // Broadcast live realtime event
  broadcastEvent("submission:verdict", {
    submissionId: submission.id,
    userId: submission.userId,
    problemId: submission.problemId,
    verdict: submission.verdict,
    runtimeMs: submission.runtimeMs,
    runtimePercentile: evaluation.runtimePercentile,
    memoryPercentile: evaluation.memoryPercentile,
    submittedAt: submission.submittedAt
  });

  response.status(201).json({
    submission,
    execution: evaluation
  });
});

export default router;

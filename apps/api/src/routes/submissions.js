import { Router } from "express";
import { createSubmissionRecord, listSubmissionRecords } from "../lib/submissionStore.js";
import { executeJavaScript } from "../lib/executeJavaScript.js";

const router = Router();

router.get("/", (_request, response) => {
  response.json({ submissions: listSubmissionRecords() });
});

router.post("/", async (request, response) => {
  const { problemId = null, language, code, stdin = "", timeoutMs } = request.body ?? {};

  if (!language || !code) {
    response.status(400).json({ error: "Both 'language' and 'code' are required." });
    return;
  }

  if (language !== "javascript") {
    response.status(400).json({
      error: "Only JavaScript submissions are supported in the first backend version."
    });
    return;
  }

  const execution = await executeJavaScript({
    code,
    stdin,
    timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : undefined
  });

  const verdict = execution.ok ? "AC" : execution.verdict === "TLE" ? "TLE" : "RE";
  const submission = createSubmissionRecord({
    problemId,
    language,
    stdin,
    verdict,
    runtimeMs: execution.runtimeMs,
    stdout: execution.stdout,
    stderr: execution.stderr
  });

  response.status(201).json({
    submission,
    execution
  });
});

export default router;

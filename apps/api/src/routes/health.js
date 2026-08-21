import { Router } from "express";
import { connectDatabase } from "../lib/db.js";
import { getSubmissionQueueHealth } from "../lib/submissionQueue.js";

const router = Router();

router.get("/", async (_request, response) => {
  const checks = {
    database: "DOWN",
    queue: "DOWN",
    worker: "DOWN"
  };

  try {
    checks.database = (await connectDatabase()) ? "UP" : "DOWN";
  } catch {}

  try {
    const queueHealth = await getSubmissionQueueHealth();
    checks.queue = "UP";
    checks.worker = queueHealth.workerCount > 0 ? "UP" : "DOWN";
  } catch {}

  const ready = Object.values(checks).every((value) => value === "UP");
  response.status(ready ? 200 : 503).json({
    ok: ready,
    status: ready ? "HEALTHY" : "DEGRADED",
    service: "online-judge-api",
    timestamp: new Date().toISOString(),
    checks
  });
});

export default router;

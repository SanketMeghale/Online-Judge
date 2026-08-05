import { Router } from "express";

const router = Router();
const JUDGE_MONITORING_URL = process.env.JUDGE_MONITORING_URL || "http://localhost:4002/health";

/**
 * GET /health
 * Aggregates API Gateway and Judge Worker Monitoring Metrics
 */
router.get("/", async (_request, response) => {
  let judgeMonitoring = null;

  try {
    const res = await fetch(JUDGE_MONITORING_URL);
    judgeMonitoring = await res.json();
  } catch (err) {
    judgeMonitoring = {
      status: "DEGRADED",
      notice: `Could not reach Judge Monitoring Service at ${JUDGE_MONITORING_URL}: ${err.message}`
    };
  }

  response.json({
    ok: true,
    service: "online-judge-api",
    timestamp: new Date().toISOString(),
    judgeWorker: judgeMonitoring
  });
});

export default router;

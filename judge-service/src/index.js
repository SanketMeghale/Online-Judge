import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { queueConsumer } from "./queue/consumer.js";
import { queueProducer } from "./queue/producer.js";
import { judgeWorker } from "./workers/JudgeWorker.js";
import { monitoringService } from "./services/MonitoringService.js";
import { dockerService } from "./services/DockerService.js";
import { validateWorkerEnvironment } from "./config/env.config.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online-judge";
const SANDBOX_IMAGE = process.env.SANDBOX_IMAGE || "online-judge-sandbox:latest";
const WORKER_CONCURRENCY = Math.max(1, Number(process.env.WORKER_CONCURRENCY || 2));
const MONITORING_PORT = Number(process.env.MONITORING_PORT || 4002);

const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "16kb" }));

app.get("/live", (_req, res) => {
  res.status(200).json({ status: "ALIVE" });
});

app.get("/health", async (req, res) => {
  const healthToken = process.env.EXECUTION_SERVICE_TOKEN;
  if (healthToken && req.headers.authorization !== `Bearer ${healthToken}`) {
    res.status(401).json({ status: "UNAUTHORIZED" });
    return;
  }

  try {
    const healthReport = await monitoringService.getHealthReport();
    res.status(healthReport.status === "HEALTHY" ? 200 : 503).json(healthReport);
  } catch {
    res.status(503).json({ status: "DEGRADED" });
  }
});

app.post(["/jobs", "/execute"], async (req, res) => {
  const healthToken = process.env.EXECUTION_SERVICE_TOKEN;
  if (healthToken && req.headers.authorization !== `Bearer ${healthToken}`) {
    res.status(401).json({ status: "UNAUTHORIZED" });
    return;
  }

  const { submissionId } = req.body || {};
  if (!submissionId) {
    res.status(400).json({ error: "submissionId is required" });
    return;
  }

  res.status(202).json({
    status: "ACCEPTED",
    submissionId: String(submissionId),
    dispatchedAt: new Date().toISOString()
  });

  setImmediate(async () => {
    try {
      console.log(`[Judge Worker] HTTP direct execution started for submission: ${submissionId}`);
      await judgeWorker.processJob(
        { submissionId: String(submissionId) },
        { jobId: `http-${submissionId}`, attempt: 1, maxAttempts: 1 }
      );
    } catch (err) {
      console.error(`[Judge Worker] HTTP execution error for ${submissionId}: ${err.message}`);
      try {
        await judgeWorker.markSystemError({ submissionId: String(submissionId) }, err);
      } catch (persistErr) {
        console.error(`[Judge Worker] Failed to mark system error: ${persistErr.message}`);
      }
    }
  });
});

let httpServer;
let shuttingDown = false;

async function startJudgeService() {
  validateWorkerEnvironment();

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("[MongoDB] Connected.");

  await dockerService.assertReady(SANDBOX_IMAGE);
  console.log(`[Docker] Sandbox image ready: ${SANDBOX_IMAGE}`);

  httpServer = app.listen(MONITORING_PORT, "0.0.0.0", () => {
    console.log(`[Judge Worker] HTTP API listening on port ${MONITORING_PORT}`);
  });

  try {
    const queue = await queueProducer.connect();
    if (queue) {
      console.log("[BullMQ] Connected.");
      await queueConsumer.startJudgeWorker(
        (jobData) => judgeWorker.processJob(jobData),
        {
          concurrency: WORKER_CONCURRENCY,
          onExhausted: (jobData, error) => judgeWorker.markSystemError(jobData, error)
        }
      );
      console.log(`[Judge Worker] BullMQ Consumer listening with concurrency=${WORKER_CONCURRENCY}`);
    }
  } catch (queueErr) {
    console.warn(`[Judge Worker] Redis queue unavailable (${queueErr.message}). Operating in direct HTTP execution mode.`);
  }
}

async function shutdown(reason, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[Judge Worker] Shutting down: ${reason}`);

  if (httpServer) await new Promise((resolve) => httpServer.close(resolve));
  await Promise.allSettled([
    queueConsumer.disconnect(),
    queueProducer.disconnect(),
    mongoose.disconnect()
  ]);
  process.exit(exitCode);
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

startJudgeService().catch((error) => {
  console.error(`[Judge Worker] Fatal startup error: ${error.message}`);
  void shutdown("startup failure", 1);
});

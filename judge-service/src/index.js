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

let httpServer;
let shuttingDown = false;

async function startJudgeService() {
  validateWorkerEnvironment();

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("[MongoDB] Connected.");

  const queue = await queueProducer.connect();
  if (!queue) throw new Error("Redis is unavailable; refusing to start the execution worker.");
  console.log("[BullMQ] Connected.");

  await dockerService.assertReady(SANDBOX_IMAGE);
  console.log(`[Docker] Sandbox image ready: ${SANDBOX_IMAGE}`);

  await queueConsumer.startJudgeWorker(
    (jobData) => judgeWorker.processJob(jobData),
    {
      concurrency: WORKER_CONCURRENCY,
      onExhausted: (jobData, error) => judgeWorker.markSystemError(jobData, error)
    }
  );

  httpServer = app.listen(MONITORING_PORT, "0.0.0.0", () => {
    console.log(`[Judge Worker] Ready on port ${MONITORING_PORT}; concurrency=${WORKER_CONCURRENCY}`);
  });
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

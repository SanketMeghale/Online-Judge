import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { queueConsumer } from "./queue/consumer.js";
import { queueProducer } from "./queue/producer.js";
import { judgeWorker } from "./workers/JudgeWorker.js";
import { monitoringService } from "./services/MonitoringService.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online-judge";
const WORKER_CONCURRENCY = Number(process.env.WORKER_CONCURRENCY || 2);
const MONITORING_PORT = Number(process.env.MONITORING_PORT || 4002);

const app = express();
app.use(cors());
app.use(express.json());

/**
 * GET /health Endpoint
 * Returns real-time metrics for queue length, execution times, running containers, worker health, memory, and CPU usage.
 */
app.get("/health", async (req, res) => {
  const healthToken = process.env.EXECUTION_SERVICE_TOKEN;
  if (healthToken && req.headers.authorization !== `Bearer ${healthToken}`) {
    res.status(401).json({ status: "UNAUTHORIZED" });
    return;
  }
  const healthReport = await monitoringService.getHealthReport();
  const httpStatus = healthReport.status === "HEALTHY" ? 200 : 503;
  res.status(httpStatus).json(healthReport);
});

console.log("======================================================================");
console.log("🚀 STARTING STANDALONE JUDGE SERVICE WORKER MICROSERVICE");
console.log("======================================================================\n");

async function startJudgeService() {
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && (!process.env.MONGODB_URI || !/^rediss?:\/\//.test(process.env.REDIS_URL || ""))) {
    throw new Error("MONGODB_URI and a valid REDIS_URL are required in production.");
  }

  // 1. Connect to MongoDB Database
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✓ [MongoDB] Connected to database successfully.");
  } catch (dbErr) {
    if (isProduction) throw dbErr;
    console.warn(`⚠️ [MongoDB] Connection offline: ${dbErr.message}. Operating in hybrid mode.`);
  }

  // 2. Connect to Redis/BullMQ
  const queue = await queueProducer.connect();
  if (queue) {
    console.log("✓ [BullMQ] Connected to Redis execution queue.");
  } else {
    throw new Error("Redis is unavailable; refusing to start the execution worker.");
  }

  // 3. Start Judge Worker Listener on 'judge_queue'
  await queueConsumer.startJudgeWorker(
    async (jobData) => {
      return await judgeWorker.processJob(jobData);
    },
    {
      concurrency: WORKER_CONCURRENCY,
      onExhausted: (jobData, error) => judgeWorker.markSystemError(jobData, error)
    }
  );

  // 4. Start HTTP Health Monitoring Server
  app.listen(MONITORING_PORT, () => {
    console.log(`✓ [Monitoring Service] GET /health HTTP endpoint running on http://localhost:${MONITORING_PORT}/health`);
  });

  console.log(`\n✓ [Judge Worker Engine] Ready and awaiting submission jobs (Concurrency: ${WORKER_CONCURRENCY})...\n`);
}

// Graceful Shutdown Handlers
process.on("SIGINT", async () => {
  console.log("\n[Judge Service] Gracefully shutting down worker process...");
  await queueConsumer.disconnect();
  await queueProducer.disconnect();
  await mongoose.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n[Judge Service] SIGTERM received. Shutting down...");
  await queueConsumer.disconnect();
  await queueProducer.disconnect();
  await mongoose.disconnect();
  process.exit(0);
});

startJudgeService().catch((error) => {
  console.error(`[Judge Service] Fatal startup error: ${error.message}`);
  process.exitCode = 1;
});

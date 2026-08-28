import { Queue } from "bullmq";
import IORedis from "ioredis";
import { JUDGE_QUEUE } from "@online-judge/shared";
import { cleanRedisUri } from "../config/env.config.js";

let redis;
let queue;

function getRedis() {
  if (!redis) {
    const url = cleanRedisUri(process.env.REDIS_URL) || "redis://127.0.0.1:6379";
    redis = new IORedis(url, {
      connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 3000),
      enableReadyCheck: true,
      maxRetriesPerRequest: 1,
      lazyConnect: true
    });
    redis.on("error", (error) => {
      console.warn(`[SubmissionQueue] Redis error: ${error.message}`);
    });
  }
  return redis;
}

function getQueue() {
  if (!queue) {
    queue = new Queue(JUDGE_QUEUE.queue, {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: Number(process.env.JOB_MAX_ATTEMPTS || 3),
        backoff: {
          type: "exponential",
          delay: Number(process.env.JOB_RETRY_DELAY_MS || 1000)
        },
        removeOnComplete: Number(process.env.JOB_HISTORY_LIMIT || 1000),
        removeOnFail: Number(process.env.JOB_FAILURE_HISTORY_LIMIT || 5000)
      }
    });
  }
  return queue;
}

export async function publishSubmissionJob({ submissionId }) {
  if (!submissionId) throw new Error("submissionId is required to enqueue a judge job");

  const executionServiceUrl = process.env.EXECUTION_SERVICE_URL;
  const executionServiceToken = process.env.EXECUTION_SERVICE_TOKEN;

  let redisError = null;

  // 1. Try BullMQ Redis queue
  try {
    const job = await getQueue().add(
      JUDGE_QUEUE.jobName,
      { submissionId: String(submissionId) },
      { jobId: String(submissionId) }
    );
    return { id: String(job.id) };
  } catch (err) {
    redisError = err;
    console.warn(`[SubmissionQueue] BullMQ enqueue failed: ${err.message}`);
  }

  // 2. Direct HTTP Fallback to judge worker microservice if configured
  if (executionServiceUrl) {
    try {
      const targetUrl = `${executionServiceUrl.replace(/\/+$/, "")}/jobs`;
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(executionServiceToken ? { Authorization: `Bearer ${executionServiceToken}` } : {})
        },
        body: JSON.stringify({ submissionId: String(submissionId) }),
        signal: AbortSignal.timeout(6000)
      });

      if (response.ok) {
        console.log(`[SubmissionQueue] Submission ${submissionId} dispatched directly via HTTP to ${targetUrl}`);
        return { id: `http-${submissionId}` };
      }
      const errBody = await response.text().catch(() => "");
      console.warn(`[SubmissionQueue] Direct HTTP dispatch returned HTTP ${response.status}: ${errBody}`);
    } catch (httpErr) {
      console.warn(`[SubmissionQueue] Direct HTTP dispatch to ${executionServiceUrl} failed: ${httpErr.message}`);
    }
  }

  // 3. Clear diagnostics if Redis quota is exceeded
  const isUpstashQuotaExceeded =
    redisError?.message?.includes("max requests limit exceeded") ||
    redisError?.cause?.message?.includes("max requests limit exceeded");

  if (isUpstashQuotaExceeded) {
    const error = new Error(
      "Upstash Redis monthly request limit exceeded (500,000 commands limit reached). To fix: switch to Redis Cloud (unlimited commands on free tier) or upgrade Upstash, or set EXECUTION_SERVICE_URL for direct worker dispatch.",
      { cause: redisError }
    );
    error.statusCode = 503;
    throw error;
  }

  const error = new Error(
    `The execution queue is currently unavailable (${redisError?.message || "connection closed"}). Please retry shortly.`,
    { cause: redisError }
  );
  error.statusCode = 503;
  throw error;
}

export async function getSubmissionQueueHealth() {
  const executionServiceUrl = process.env.EXECUTION_SERVICE_URL;
  const executionServiceToken = process.env.EXECUTION_SERVICE_TOKEN;

  try {
    const executionQueue = getQueue();
    const [counts, heartbeat] = await Promise.all([
      executionQueue.getJobCounts("wait", "active", "delayed", "failed"),
      getRedis().get(JUDGE_QUEUE.workerHeartbeatKey)
    ]);
    return { ok: true, counts, workerCount: heartbeat ? 1 : 0 };
  } catch (redisErr) {
    if (executionServiceUrl) {
      try {
        const targetUrl = `${executionServiceUrl.replace(/\/+$/, "")}/health`;
        const res = await fetch(targetUrl, {
          headers: executionServiceToken ? { Authorization: `Bearer ${executionServiceToken}` } : {},
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          return { ok: true, counts: { wait: 0, active: 0, delayed: 0, failed: 0 }, workerCount: 1, mode: "HTTP_DIRECT" };
        }
      } catch {}
    }
    throw redisErr;
  }
}

export async function closeSubmissionQueue() {
  if (queue) await queue.close();
  if (redis) await redis.quit();
  queue = null;
  redis = null;
}

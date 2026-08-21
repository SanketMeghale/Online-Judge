import { Queue } from "bullmq";
import IORedis from "ioredis";
import { JUDGE_QUEUE } from "@online-judge/shared";

let redis;
let queue;

function getRedis() {
  if (!redis) {
    const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
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
  const job = await getQueue().add(
    JUDGE_QUEUE.jobName,
    { submissionId: String(submissionId) },
    { jobId: String(submissionId) }
  );
  return { id: String(job.id) };
}

export async function getSubmissionQueueHealth() {
  const counts = await getQueue().getJobCounts("wait", "active", "delayed", "failed");
  return { ok: true, counts };
}

export async function closeSubmissionQueue() {
  if (queue) await queue.close();
  if (redis) await redis.quit();
  queue = null;
  redis = null;
}

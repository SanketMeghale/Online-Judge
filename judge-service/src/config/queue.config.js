import { JUDGE_QUEUE } from "@online-judge/shared";

export const QUEUE_CONFIG = Object.freeze({
  REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  QUEUE_NAME: JUDGE_QUEUE.queue,
  WORKER_PREFETCH: Number(process.env.WORKER_PREFETCH || 2),
  MAX_RETRY_ATTEMPTS: Number(process.env.JOB_MAX_ATTEMPTS || 3)
});

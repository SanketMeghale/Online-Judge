import { Worker } from "bullmq";
import IORedis from "ioredis";
import { JUDGE_QUEUE } from "@online-judge/shared";

export class QueueConsumer {
  constructor({ WorkerClass = Worker, RedisClass = IORedis } = {}) {
    this.WorkerClass = WorkerClass;
    this.RedisClass = RedisClass;
    this.connection = null;
    this.worker = null;
    this.isListening = false;
  }

  async startJudgeWorker(jobHandler, options = {}) {
    if (this.worker) return this.worker;
    const concurrency = Math.max(1, Number(options.concurrency || process.env.WORKER_CONCURRENCY || 2));
    this.connection = new this.RedisClass(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
      maxRetriesPerRequest: null,
      enableReadyCheck: true
    });

    this.worker = new this.WorkerClass(
      JUDGE_QUEUE.queue,
      async (job) => jobHandler(job.data, {
        jobId: String(job.id),
        attempt: job.attemptsMade + 1,
        maxAttempts: Number(job.opts.attempts || 1)
      }),
      {
        connection: this.connection,
        concurrency,
        lockDuration: Number(process.env.JOB_LOCK_DURATION_MS || 120_000),
        limiter: {
          max: Math.max(1, Number(process.env.WORKER_RATE_LIMIT_MAX || concurrency * 30)),
          duration: 60_000
        }
      }
    );

    this.worker.on("ready", () => {
      this.isListening = true;
      console.log(`[BullMQ Worker] Listening on '${JUDGE_QUEUE.queue}' with concurrency=${concurrency}`);
    });
    this.worker.on("error", (error) => {
      console.error(`[BullMQ Worker] ${error.message}`);
    });
    this.worker.on("failed", async (job, error) => {
      const attempts = Number(job?.opts?.attempts || 1);
      const exhausted = Number(job?.attemptsMade || 0) >= attempts;
      console.error(JSON.stringify({
        event: exhausted ? "job_exhausted" : "job_retry",
        jobId: job?.id,
        submissionId: job?.data?.submissionId,
        attemptsMade: job?.attemptsMade,
        attempts,
        error: error.message
      }));
      if (exhausted && typeof options.onExhausted === "function") {
        try {
          await options.onExhausted(job?.data, error);
        } catch (persistenceError) {
          console.error(`[BullMQ Worker] Failed to persist exhausted job status: ${persistenceError.message}`);
        }
      }
    });

    await this.worker.waitUntilReady();
    this.isListening = true;
    return this.worker;
  }

  async disconnect() {
    if (this.worker) await this.worker.close();
    if (this.connection) await this.connection.quit();
    this.worker = null;
    this.connection = null;
    this.isListening = false;
  }
}

export const queueConsumer = new QueueConsumer();
export default queueConsumer;

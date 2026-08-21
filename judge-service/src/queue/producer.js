import { Queue } from "bullmq";
import IORedis from "ioredis";
import { JUDGE_QUEUE } from "@online-judge/shared";

export class QueueProducer {
  constructor() {
    this.connection = null;
    this.queue = null;
  }

  async connect() {
    if (this.queue) return this.queue;
    this.connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 3000),
      retryStrategy: (attempt) => Math.min(attempt * 250, 5000)
    });
    this.connection.on("error", (error) => {
      console.warn(`[BullMQ] Redis error: ${error.message}`);
    });
    this.queue = new Queue(JUDGE_QUEUE.queue, { connection: this.connection });
    await this.queue.waitUntilReady();
    return this.queue;
  }

  async getCounts() {
    const queue = await this.connect();
    return queue.getJobCounts("wait", "active", "delayed", "completed", "failed");
  }

  async disconnect() {
    if (this.queue) await this.queue.close();
    if (this.connection) await this.connection.quit();
    this.queue = null;
    this.connection = null;
  }
}

export const queueProducer = new QueueProducer();
export default queueProducer;

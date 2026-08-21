import { jest, describe, test, expect } from "@jest/globals";
import { QueueConsumer } from "../src/queue/consumer.js";

class FakeRedis {
  constructor() {
    this.set = jest.fn().mockResolvedValue("OK");
  }
  async quit() {}
}

class FakeWorker {
  constructor(name, processor, options) {
    this.name = name;
    this.processor = processor;
    this.options = options;
    this.handlers = {};
  }
  on(event, handler) {
    this.handlers[event] = handler;
  }
  async waitUntilReady() {}
  async close() {}
}

describe("BullMQ Consumer", () => {
  test("starts a horizontally scalable worker with configured concurrency", async () => {
    const consumer = new QueueConsumer({ WorkerClass: FakeWorker, RedisClass: FakeRedis });
    const handler = jest.fn().mockResolvedValue({ verdict: "AC" });
    await consumer.startJudgeWorker(handler, { concurrency: 5 });

    expect(consumer.isListening).toBe(true);
    expect(consumer.worker.options.concurrency).toBe(5);
    expect(consumer.connection.set).toHaveBeenCalledWith(
      "judgo-execution:worker-heartbeat",
      expect.stringContaining('"workerId"'),
      "PX",
      30_000
    );
    await consumer.worker.processor({
      id: "job-1",
      data: { submissionId: "submission-1" },
      attemptsMade: 0,
      opts: { attempts: 3 }
    });
    expect(handler).toHaveBeenCalledWith(
      { submissionId: "submission-1" },
      { jobId: "job-1", attempt: 1, maxAttempts: 3 }
    );
    await consumer.disconnect();
  });

  test("marks infrastructure failure only after BullMQ exhausts retries", async () => {
    const consumer = new QueueConsumer({ WorkerClass: FakeWorker, RedisClass: FakeRedis });
    const onExhausted = jest.fn().mockResolvedValue();
    await consumer.startJudgeWorker(async () => {}, { onExhausted });

    const job = {
      id: "job-failed",
      data: { submissionId: "submission-failed" },
      attemptsMade: 3,
      opts: { attempts: 3 }
    };
    await consumer.worker.handlers.failed(job, new Error("Docker temporarily unavailable"));
    expect(onExhausted).toHaveBeenCalledWith(job.data, expect.any(Error));
    await consumer.disconnect();
  });

  test("allows multiple jobs to be processed concurrently", async () => {
    const consumer = new QueueConsumer({ WorkerClass: FakeWorker, RedisClass: FakeRedis });
    let active = 0;
    let peak = 0;
    const handler = async () => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 10));
      active -= 1;
    };
    await consumer.startJudgeWorker(handler, { concurrency: 3 });
    await Promise.all([1, 2, 3].map((id) => consumer.worker.processor({
      id: `job-${id}`,
      data: { submissionId: `submission-${id}` },
      attemptsMade: 0,
      opts: { attempts: 3 }
    })));
    expect(peak).toBe(3);
    await consumer.disconnect();
  });
});

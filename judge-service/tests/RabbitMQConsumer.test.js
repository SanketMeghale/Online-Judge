import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { QueueConsumer } from "../src/queue/consumer.js";

describe("RabbitMQ Consumer Unit Tests", () => {
  let consumer;

  beforeEach(() => {
    consumer = new QueueConsumer();
  });

  test("1. Initializes Consumer instance with disconnected initial state", () => {
    expect(consumer.isListening).toBe(false);
    expect(consumer.channel).toBeNull();
  });

  test("2. Mock Worker Message Consumption & Manual Acknowledgment (channel.ack)", async () => {
    let ackedMessage = null;
    let jobExecuted = null;

    const mockChannel = {
      prefetch: jest.fn().mockResolvedValue(true),
      consume: jest.fn().mockImplementation(async (queue, callback, opts) => {
        expect(opts.noAck).toBe(false); // Verifies Manual ACKs required!

        const mockMsg = {
          content: Buffer.from(JSON.stringify({
            submissionId: "S-1001",
            problemId: "two-sum",
            userId: "u-demo-1",
            language: "python",
            code: "print('hello')"
          })),
          properties: { headers: {} }
        };

        // Trigger message consumption callback
        await callback(mockMsg);
      }),
      ack: jest.fn().mockImplementation((msg) => {
        ackedMessage = msg;
      })
    };

    // Mock connect() to return mockChannel
    jest.spyOn(consumer, "connect").mockResolvedValue(mockChannel);

    const mockJobHandler = async (jobData) => {
      jobExecuted = jobData;
      return { verdict: "AC", statusText: "Accepted", runtimeMs: 15, memoryMb: 12.4 };
    };

    await consumer.startJudgeWorker(mockJobHandler, { concurrency: 5 });

    expect(mockChannel.prefetch).toHaveBeenCalledWith(5);
    expect(jobExecuted).toBeDefined();
    expect(jobExecuted.submissionId).toBe("S-1001");
    expect(mockChannel.ack).toHaveBeenCalled();
  });

  test("3. Handles job failure and triggers retry limit check before DLQ (channel.nack)", async () => {
    const mockChannel = {
      prefetch: jest.fn(),
      consume: jest.fn().mockImplementation(async (queue, callback) => {
        const mockMsg = {
          content: Buffer.from(JSON.stringify({
            submissionId: "S-FAIL-99",
            retryCount: 3 // Exceeds max retries (3)
          })),
          properties: { headers: { "x-retry-count": 3 } }
        };

        await callback(mockMsg);
      }),
      nack: jest.fn()
    };

    jest.spyOn(consumer, "connect").mockResolvedValue(mockChannel);

    const failingJobHandler = async () => {
      throw new Error("Job Evaluation Crashed");
    };

    await consumer.startJudgeWorker(failingJobHandler);

    // Should nack to Dead Letter Queue (DLQ) after exceeding max retries
    expect(mockChannel.nack).toHaveBeenCalledWith(expect.anything(), false, false);
  });
});

import amqp from "amqplib";
import { QUEUE_CONFIG } from "../config/queue.config.js";

/**
 * QueueProducer - Production RabbitMQ Message Publisher
 * 
 * Features:
 * 1. Durable Exchanges & Queues Assertion
 * 2. Persistent Message Delivery Mode (deliveryMode: 2)
 * 3. Publishes Submissions to Judge Queue
 * 4. Publishes Verdict Results to Verdict Queue
 * 5. Handles Dead Letter Retries & Fallbacks
 */
export class QueueProducer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnecting = false;
  }

  /**
   * Connects to RabbitMQ server and initializes exchange/queue topology
   */
  async connect() {
    if (this.channel) return this.channel;
    if (this.isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return this.channel;
    }

    this.isConnecting = true;

    try {
      this.connection = await amqp.connect(QUEUE_CONFIG.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // Handle connection errors & reconnect
      this.connection.on("error", (err) => {
        console.error(`[RabbitMQ Producer] Connection error: ${err.message}`);
        this.channel = null;
        this.connection = null;
      });

      this.connection.on("close", () => {
        console.warn("[RabbitMQ Producer] Connection closed.");
        this.channel = null;
        this.connection = null;
      });

      // 1. Assert Direct Exchanges
      await this.channel.assertExchange(QUEUE_CONFIG.EXCHANGES.JUDGE_EXCHANGE, "direct", { durable: true });
      await this.channel.assertExchange(QUEUE_CONFIG.EXCHANGES.RETRY_EXCHANGE, "direct", { durable: true });
      await this.channel.assertExchange(QUEUE_CONFIG.EXCHANGES.DLX_EXCHANGE, "direct", { durable: true });

      // 2. Assert Durable Queues
      // Judge Queue: Main queue consumed by judge workers
      await this.channel.assertQueue(QUEUE_CONFIG.QUEUES.JUDGE_QUEUE, {
        durable: true,
        deadLetterExchange: QUEUE_CONFIG.EXCHANGES.DLX_EXCHANGE,
        deadLetterRoutingKey: QUEUE_CONFIG.ROUTING_KEYS.DEAD_LETTER
      });

      // Submission Queue (Alias/Entry point)
      await this.channel.assertQueue(QUEUE_CONFIG.QUEUES.SUBMISSION_QUEUE, { durable: true });

      // Verdict Queue: Queue consumed by API server for Socket.IO realtime stream
      await this.channel.assertQueue(QUEUE_CONFIG.QUEUES.VERDICT_QUEUE, { durable: true });

      // Dead Letter Queue (DLQ) for failed retries
      await this.channel.assertQueue(QUEUE_CONFIG.QUEUES.DEAD_LETTER_QUEUE, { durable: true });

      // 3. Bind Queues to Exchanges
      await this.channel.bindQueue(
        QUEUE_CONFIG.QUEUES.JUDGE_QUEUE,
        QUEUE_CONFIG.EXCHANGES.JUDGE_EXCHANGE,
        QUEUE_CONFIG.ROUTING_KEYS.SUBMISSION_JOB
      );

      await this.channel.bindQueue(
        QUEUE_CONFIG.QUEUES.VERDICT_QUEUE,
        QUEUE_CONFIG.EXCHANGES.JUDGE_EXCHANGE,
        QUEUE_CONFIG.ROUTING_KEYS.VERDICT_RESULT
      );

      await this.channel.bindQueue(
        QUEUE_CONFIG.QUEUES.DEAD_LETTER_QUEUE,
        QUEUE_CONFIG.EXCHANGES.DLX_EXCHANGE,
        QUEUE_CONFIG.ROUTING_KEYS.DEAD_LETTER
      );

      this.isConnecting = false;
      return this.channel;
    } catch (err) {
      this.isConnecting = false;
      console.warn(`[RabbitMQ Producer] Connection failed: ${err.message}. Operating in fallback mode.`);
      return null;
    }
  }

  /**
   * Publishes Code Submission Job to Judge Queue
   * @param {Object} submissionJob - Payload ({ submissionId, problemId, userId, language, code, stdin, expectedOutput })
   * @returns {Promise<boolean>} True if successfully published to RabbitMQ
   */
  async publishSubmissionJob(submissionJob) {
    try {
      const channel = await this.connect();
      if (!channel) return false;

      const payloadBuffer = Buffer.from(JSON.stringify({
        ...submissionJob,
        timestamp: Date.now(),
        retryCount: submissionJob.retryCount || 0
      }));

      const published = channel.publish(
        QUEUE_CONFIG.EXCHANGES.JUDGE_EXCHANGE,
        QUEUE_CONFIG.ROUTING_KEYS.SUBMISSION_JOB,
        payloadBuffer,
        {
          persistent: true, // Persistent message storage on disk
          headers: {
            "x-retry-count": submissionJob.retryCount || 0
          }
        }
      );

      return published;
    } catch (err) {
      console.error(`[RabbitMQ Producer] Failed to publish submission job: ${err.message}`);
      return false;
    }
  }

  /**
   * Publishes Completed Evaluation Verdict Result to Verdict Queue
   * @param {Object} verdictPayload - Payload ({ submissionId, verdict, statusText, passCount, totalCount, runtimeMs, memoryMb, testcases })
   * @returns {Promise<boolean>} True if successfully published to RabbitMQ
   */
  async publishVerdictResult(verdictPayload) {
    try {
      const channel = await this.connect();
      if (!channel) return false;

      const payloadBuffer = Buffer.from(JSON.stringify({
        ...verdictPayload,
        completedAt: Date.now()
      }));

      const published = channel.publish(
        QUEUE_CONFIG.EXCHANGES.JUDGE_EXCHANGE,
        QUEUE_CONFIG.ROUTING_KEYS.VERDICT_RESULT,
        payloadBuffer,
        { persistent: true }
      );

      return published;
    } catch (err) {
      console.error(`[RabbitMQ Producer] Failed to publish verdict result: ${err.message}`);
      return false;
    }
  }

  /**
   * Disconnects RabbitMQ channel & connection
   */
  async disconnect() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (err) {
      // Ignore cleanup errors
    } finally {
      this.channel = null;
      this.connection = null;
    }
  }
}

// Export singleton instance
export const queueProducer = new QueueProducer();

// Default export for import flexibility
export default queueProducer;

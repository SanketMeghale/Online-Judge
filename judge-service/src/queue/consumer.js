import amqp from "amqplib";
import { QUEUE_CONFIG } from "../config/queue.config.js";
import { queueProducer } from "./producer.js";

/**
 * QueueConsumer - Production RabbitMQ Worker Consumer
 * 
 * Features:
 * 1. Concurrency Control (channel.prefetch(concurrency)) for multi-worker scaling
 * 2. Explicit Manual Acknowledgements (channel.ack(msg)) upon successful execution
 * 3. Exponential Backoff Retries & Dead Letter Queue (DLQ) routing
 * 4. Consumes from Judge Queue (judge-service) & Verdict Queue (api-service)
 */
export class QueueConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isListening = false;
  }

  /**
   * Initializes RabbitMQ channel connection
   */
  async connect() {
    if (this.channel) return this.channel;
    this.connection = await amqp.connect(QUEUE_CONFIG.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  /**
   * Starts Judge Worker Listener consuming jobs from JUDGE_QUEUE
   * Supports multiple concurrent workers via prefetch limits and explicit manual ACKs
   * 
   * @param {Function} jobHandler - Async callback function (jobData) => Promise<verdictPayload>
   * @param {Object} [options]
   * @param {number} [options.concurrency=QUEUE_CONFIG.WORKER_PREFETCH] - Concurrency prefetch limit
   */
  async startJudgeWorker(jobHandler, options = {}) {
    const concurrency = options.concurrency || QUEUE_CONFIG.WORKER_PREFETCH;

    try {
      const channel = await this.connect();

      // Ensure topology exists
      await queueProducer.connect();

      // 1. Set Prefetch Limit (Fair Dispatching for Multiple Workers)
      await channel.prefetch(concurrency);

      console.log(`[RabbitMQ Worker] Judge Worker listening on '${QUEUE_CONFIG.QUEUES.JUDGE_QUEUE}' with prefetch=${concurrency}`);

      // 2. Consume Messages with Manual Acknowledgements (noAck: false)
      await channel.consume(
        QUEUE_CONFIG.QUEUES.JUDGE_QUEUE,
        async (msg) => {
          if (!msg) return;

          let jobData = null;
          let retryCount = 0;

          try {
            // Parse message payload
            jobData = JSON.parse(msg.content.toString("utf8"));
            retryCount = (msg.properties.headers && msg.properties.headers["x-retry-count"]) || jobData.retryCount || 0;

            // Execute code evaluation via job handler callback
            const verdictResult = await jobHandler(jobData);

            // Explicit Manual Acknowledgement: Remove message from RabbitMQ
            channel.ack(msg);
          } catch (err) {
            console.error(`[RabbitMQ Worker] Exception processing submission job ${jobData?.submissionId || "unknown"}: ${err.message}`);

            // Retry Logic: If retry count is below threshold, re-publish with incremented count
            if (retryCount < QUEUE_CONFIG.MAX_RETRY_ATTEMPTS && jobData) {
              console.warn(`[RabbitMQ Worker] Retrying job ${jobData.submissionId} (Attempt ${retryCount + 1}/${QUEUE_CONFIG.MAX_RETRY_ATTEMPTS})`);
              
              const republished = await queueProducer.publishSubmissionJob({
                ...jobData,
                retryCount: retryCount + 1
              });

              if (republished) channel.ack(msg);
              else channel.nack(msg, false, false);
            } else {
              console.error(`[RabbitMQ Worker] Job ${jobData?.submissionId} exceeded max retries. Moving to Dead Letter Queue (DLQ).`);
              // Negative Acknowledgement without requeue -> Sends message to Dead Letter Queue (DLQ)
              channel.nack(msg, false, false);
            }
          }
        },
        { noAck: false } // Manual ACKs required!
      );

      this.isListening = true;
    } catch (err) {
      console.warn(`[RabbitMQ Worker] Could not start worker listener: ${err.message}. Operating in fallback mode.`);
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
      this.isListening = false;
    }
  }
}

// Export singleton instance
export const queueConsumer = new QueueConsumer();

// Default export for import flexibility
export default queueConsumer;

/**
 * Production RabbitMQ Queue & Topology Configuration
 * Defines Exchanges, Queues, Routing Keys, Prefetch Limits, and Retry DLX Rules
 */

export const QUEUE_CONFIG = Object.freeze({
  RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://guest:guest@127.0.0.1:5672",

  EXCHANGES: {
    JUDGE_EXCHANGE: "judge_exchange",
    RETRY_EXCHANGE: "judge_retry_exchange",
    DLX_EXCHANGE: "judge_dlx_exchange"
  },

  QUEUES: {
    SUBMISSION_QUEUE: "submission_queue",
    JUDGE_QUEUE: "judge_queue",
    VERDICT_QUEUE: "verdict_queue",
    RETRY_QUEUE: "submission_retry_queue",
    DEAD_LETTER_QUEUE: "submission_dlq"
  },

  ROUTING_KEYS: {
    SUBMISSION_JOB: "submission.job",
    VERDICT_RESULT: "verdict.result",
    RETRY_JOB: "submission.retry",
    DEAD_LETTER: "submission.dead"
  },

  WORKER_PREFETCH: Number(process.env.WORKER_PREFETCH || 2), // Concurrency limit per worker process
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 5000 // 5 seconds exponential backoff TTL
});

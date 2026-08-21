import { JUDGE_QUEUE } from "@online-judge/shared";

export const QUEUE_CONFIG = Object.freeze({
  RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://guest:guest@127.0.0.1:5672",
  EXCHANGES: {
    JUDGE_EXCHANGE: JUDGE_QUEUE.exchange,
    DLX_EXCHANGE: JUDGE_QUEUE.deadLetterExchange
  },
  QUEUES: {
    JUDGE_QUEUE: JUDGE_QUEUE.queue,
    DEAD_LETTER_QUEUE: JUDGE_QUEUE.deadLetterQueue
  },
  ROUTING_KEYS: {
    SUBMISSION_JOB: JUDGE_QUEUE.submissionRoutingKey,
    DEAD_LETTER: JUDGE_QUEUE.deadLetterRoutingKey
  },
  WORKER_PREFETCH: Number(process.env.WORKER_PREFETCH || 2),
  MAX_RETRY_ATTEMPTS: 3
});

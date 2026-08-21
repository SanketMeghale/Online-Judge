import amqp from "amqplib";
import { JUDGE_QUEUE } from "@online-judge/shared";

let connection = null;
let channel = null;
let connecting = null;

async function connect() {
  if (channel) return channel;
  if (connecting) return connecting;

  connecting = (async () => {
    const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://guest:guest@127.0.0.1:5672";
    connection = await amqp.connect(rabbitmqUrl);
    connection.once("error", () => {
      channel = null;
      connection = null;
    });
    connection.once("close", () => {
      channel = null;
      connection = null;
    });

    channel = await connection.createConfirmChannel();
    await channel.assertExchange(JUDGE_QUEUE.exchange, "direct", { durable: true });
    await channel.assertExchange(JUDGE_QUEUE.deadLetterExchange, "direct", { durable: true });
    await channel.assertQueue(JUDGE_QUEUE.queue, {
      durable: true,
      deadLetterExchange: JUDGE_QUEUE.deadLetterExchange,
      deadLetterRoutingKey: JUDGE_QUEUE.deadLetterRoutingKey
    });
    await channel.assertQueue(JUDGE_QUEUE.deadLetterQueue, { durable: true });
    await channel.bindQueue(JUDGE_QUEUE.queue, JUDGE_QUEUE.exchange, JUDGE_QUEUE.submissionRoutingKey);
    await channel.bindQueue(JUDGE_QUEUE.deadLetterQueue, JUDGE_QUEUE.deadLetterExchange, JUDGE_QUEUE.deadLetterRoutingKey);
    return channel;
  })();

  try {
    return await connecting;
  } finally {
    connecting = null;
  }
}

export async function publishSubmissionJob(job) {
  try {
    const confirmChannel = await connect();
    confirmChannel.publish(
      JUDGE_QUEUE.exchange,
      JUDGE_QUEUE.submissionRoutingKey,
      Buffer.from(JSON.stringify({ ...job, timestamp: Date.now(), retryCount: job.retryCount || 0 })),
      { persistent: true, contentType: "application/json", headers: { "x-retry-count": job.retryCount || 0 } }
    );
    await confirmChannel.waitForConfirms();
    return true;
  } catch (error) {
    channel = null;
    console.warn(`[SubmissionQueue] Publish failed: ${error.message}`);
    return false;
  }
}

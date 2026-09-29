import amqp from "amqplib";

const rabbitUrl =
  process.env.RABBITMQ_URL ??
  "amqp://collector:collector_rabbit@localhost:5674";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let channel = null;

export function rabbitConnected() {
  return Boolean(channel);
}

export async function connectPublisher() {
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const connection = await amqp.connect(rabbitUrl);
      connection.on("close", () => { channel = null; });
      connection.on("error", () => { channel = null; });
      channel = await connection.createConfirmChannel();
      await channel.assertExchange("collector.events", "topic", { durable: true });
      return;
    } catch (error) {
      lastError = error;
      console.log(`RabbitMQ not ready for listing (attempt ${attempt}/30)...`);
      await wait(1500);
    }
  }
  throw lastError;
}

export async function publishListingCreated(listing) {
  if (!channel) {
    throw new Error("RabbitMQ publisher unavailable");
  }

  const payload = Buffer.from(JSON.stringify(listing));
  channel.publish(
    "collector.events",
    "listing.created",
    payload,
    {
      persistent: true,
      contentType: "application/json",
      messageId: `listing-created-${listing.id}`,
      timestamp: Date.now()
    }
  );
  await channel.waitForConfirms();
}

import amqp from "amqplib";
import { projectListing } from "./db.js";

const rabbitUrl =
  process.env.RABBITMQ_URL ??
  "amqp://collector:collector_rabbit@localhost:5674";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let connected = false;

export function rabbitConnected() {
  return connected;
}

export async function startCatalogConsumer() {
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const connection = await amqp.connect(rabbitUrl);
      connection.on("close", () => { connected = false; });
      connection.on("error", () => { connected = false; });
      const channel = await connection.createChannel();
      await channel.assertExchange("collector.events", "topic", { durable: true });
      const queue = await channel.assertQueue("catalog.listing-created", { durable: true });
      await channel.bindQueue(queue.queue, "collector.events", "listing.created");
      await channel.prefetch(10);
      connected = true;

      await channel.consume(queue.queue, async (message) => {
        if (!message) return;
        try {
          const event = JSON.parse(message.content.toString());
          await projectListing(event);
          channel.ack(message);
          console.log(`Catalog projection updated for listing ${event.id}`);
        } catch (error) {
          console.error("Catalog event processing failed:", error.message);
          channel.nack(message, false, false);
        }
      });
      return;
    } catch (error) {
      lastError = error;
      console.log(`RabbitMQ not ready for catalog (attempt ${attempt}/30)...`);
      await wait(1500);
    }
  }
  throw lastError;
}

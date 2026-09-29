import "dotenv/config";
import amqp from "amqplib";
import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3003);
const rabbitUrl =
  process.env.RABBITMQ_URL ??
  "amqp://collector:collector_rabbit@localhost:5674";

const recentNotifications = [];
let rabbitReady = false;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function startConsumer() {
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const connection = await amqp.connect(rabbitUrl);
      connection.on("close", () => { rabbitReady = false; });
      connection.on("error", () => { rabbitReady = false; });
      const channel = await connection.createChannel();
      await channel.assertExchange("collector.events", "topic", { durable: true });
      const queue = await channel.assertQueue("notification.listing-created", { durable: true });
      await channel.bindQueue(queue.queue, "collector.events", "listing.created");
      rabbitReady = true;

      await channel.consume(queue.queue, (message) => {
        if (!message) return;
        try {
          const event = JSON.parse(message.content.toString());
          const notification = {
            type: "NEW_LISTING",
            listingId: event.id,
            title: event.title,
            seller: event.seller,
            createdAt: new Date().toISOString()
          };
          recentNotifications.unshift(notification);
          recentNotifications.splice(20);
          console.log("Notification demo:", JSON.stringify(notification));
          channel.ack(message);
        } catch (error) {
          console.error("Notification event processing failed:", error.message);
          channel.nack(message, false, false);
        }
      });
      return;
    } catch (error) {
      lastError = error;
      console.log(`RabbitMQ not ready for notification (attempt ${attempt}/30)...`);
      await wait(1500);
    }
  }
  throw lastError;
}

app.get("/health", (_req, res) => {
  res.status(rabbitReady ? 200 : 503).json({
    status: rabbitReady ? "ok" : "degraded",
    service: "notification-service",
    rabbitmq: rabbitReady ? "up" : "down"
  });
});

app.get("/notifications/recent", (_req, res) => {
  res.json(recentNotifications);
});

await startConsumer();

app.listen(port, () => {
  console.log(`Notification Service listening on http://localhost:${port}`);
});

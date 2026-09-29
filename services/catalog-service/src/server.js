import "dotenv/config";
import express from "express";
import { initDb, pool } from "./db.js";
import { rabbitConnected, startCatalogConsumer } from "./messaging.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      service: "catalog-service",
      database: "up",
      rabbitmq: rabbitConnected() ? "up" : "down"
    });
  } catch {
    res.status(503).json({ status: "degraded", service: "catalog-service", database: "down" });
  }
});

app.get("/catalog", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, source, source_id, title, description, price_cents, seller, created_at
       FROM catalog_items ORDER BY created_at DESC, id DESC`
    );
    res.json(rows.map((item) => ({ ...item, price: item.price_cents / 100 })));
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Catalog service internal error" });
});

await initDb();
await startCatalogConsumer();

app.listen(port, () => {
  console.log(`Catalog Service listening on http://localhost:${port}`);
});

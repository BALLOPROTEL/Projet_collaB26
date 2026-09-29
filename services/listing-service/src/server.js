import "dotenv/config";
import express from "express";
import { initDb, pool } from "./db.js";
import { requireAuth, requireRole } from "./auth.js";
import { getRoles } from "./roles.js";
import { connectPublisher, publishListingCreated, rabbitConnected } from "./messaging.js";

const app = express();
const port = Number(process.env.PORT ?? 3002);
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      service: "listing-service",
      database: "up",
      rabbitmq: rabbitConnected() ? "up" : "down"
    });
  } catch {
    res.status(503).json({ status: "degraded", service: "listing-service", database: "down" });
  }
});

app.get("/listings", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, title, description, price_cents, seller, created_at FROM listings ORDER BY created_at DESC, id DESC"
    );
    res.json(rows.map((item) => ({ ...item, price: item.price_cents / 100 })));
  } catch (error) {
    next(error);
  }
});

app.get("/me", requireAuth, (req, res) => {
  res.json({
    username: req.user.preferred_username ?? req.user.sub,
    roles: getRoles(req.user),
    service: "listing-service"
  });
});

app.post("/listings", requireAuth, async (req, res, next) => {
  try {
    if (!rabbitConnected()) {
      return res.status(503).json({ error: "Messaging service unavailable" });
    }

    const title = String(req.body.title ?? "").trim();
    const description = String(req.body.description ?? "").trim();
    const price = Number(req.body.price);

    if (!title || !description || !Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        error: "title, description and a positive price are required"
      });
    }

    const seller = req.user.preferred_username ?? req.user.sub;
    const priceCents = Math.round(price * 100);

    const { rows } = await pool.query(
      `INSERT INTO listings (title, description, price_cents, seller)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, price_cents, seller, created_at`,
      [title, description, priceCents, seller]
    );

    const listing = rows[0];
    await publishListingCreated(listing);

    res.status(201).json({
      ...listing,
      price: listing.price_cents / 100,
      event: "listing.created"
    });
  } catch (error) {
    next(error);
  }
});

app.get(
  "/admin/stats",
  requireAuth,
  requireRole("ADMIN"),
  async (_req, res, next) => {
    try {
      const { rows } = await pool.query("SELECT COUNT(*)::int AS listings FROM listings");
      res.json({
        listings: rows[0].listings,
        service: "listing-service",
        message: "Admin access granted"
      });
    } catch (error) {
      next(error);
    }
  }
);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Listing service internal error" });
});

await initDb();
await connectPublisher();

app.listen(port, () => {
  console.log(`Listing Service listening on http://localhost:${port}`);
});

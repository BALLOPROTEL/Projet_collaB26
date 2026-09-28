import "dotenv/config";
import cors from "cors";
import express from "express";
import { initDb, pool } from "./db.js";
import { requireAuth, requireRole } from "./auth.js";
import { getRoles } from "./roles.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(
  cors({
    origin: corsOrigin,
    credentials: false
  })
);
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      service: "collector-api",
      database: "up"
    });
  } catch {
    res.status(503).json({
      status: "degraded",
      service: "collector-api",
      database: "down"
    });
  }
});

app.get("/api/catalog", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, description, price_cents, seller, created_at
       FROM listings
       ORDER BY created_at DESC, id DESC`
    );

    res.json(
      rows.map((item) => ({
        ...item,
        price: item.price_cents / 100
      }))
    );
  } catch (error) {
    next(error);
  }
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({
    username: req.user.preferred_username ?? req.user.sub,
    roles: getRoles(req.user)
  });
});

app.post("/api/listings", requireAuth, async (req, res, next) => {
  try {
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

    const item = rows[0];
    res.status(201).json({
      ...item,
      price: item.price_cents / 100
    });
  } catch (error) {
    next(error);
  }
});

app.get(
  "/api/admin/stats",
  requireAuth,
  requireRole("ADMIN"),
  async (_req, res, next) => {
    try {
      const { rows } = await pool.query(
        "SELECT COUNT(*)::int AS listings FROM listings"
      );

      res.json({
        listings: rows[0].listings,
        message: "Admin access granted"
      });
    } catch (error) {
      next(error);
    }
  }
);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

await initDb();

app.listen(port, () => {
  console.log(`Collector API listening on http://localhost:${port}`);
});

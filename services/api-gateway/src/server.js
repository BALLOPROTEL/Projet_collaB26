import "dotenv/config";
import cors from "cors";
import express from "express";
import crypto from "node:crypto";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const catalogUrl = process.env.CATALOG_SERVICE_URL ?? "http://localhost:3001";
const listingUrl = process.env.LISTING_SERVICE_URL ?? "http://localhost:3002";
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

function headersFor(req) {
  const headers = { "x-correlation-id": req.headers["x-correlation-id"] ?? crypto.randomUUID() };
  if (req.headers.authorization) headers.authorization = req.headers.authorization;
  if (req.headers["content-type"]) headers["content-type"] = req.headers["content-type"];
  return headers;
}

async function proxy(req, res, target) {
  try {
    const response = await fetch(target, {
      method: req.method,
      headers: headersFor(req),
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body ?? {})
    });
    const text = await response.text();
    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("content-type", contentType);
    res.status(response.status).send(text);
  } catch (error) {
    console.error("Gateway proxy error:", error.message);
    res.status(502).json({ error: "Upstream service unavailable" });
  }
}

async function serviceHealth(name, url) {
  try {
    const response = await fetch(url);
    return { name, ok: response.ok, status: response.status };
  } catch {
    return { name, ok: false, status: 0 };
  }
}

app.get("/api/health", async (_req, res) => {
  const services = await Promise.all([
    serviceHealth("catalog-service", `${catalogUrl}/health`),
    serviceHealth("listing-service", `${listingUrl}/health`)
  ]);
  const ok = services.every((service) => service.ok);
  res.status(ok ? 200 : 503).json({
    status: ok ? "ok" : "degraded",
    service: "api-gateway",
    services
  });
});

app.get("/api/catalog", (req, res) => proxy(req, res, `${catalogUrl}/catalog`));
app.get("/api/listings", (req, res) => proxy(req, res, `${listingUrl}/listings`));
app.post("/api/listings", (req, res) => proxy(req, res, `${listingUrl}/listings`));
app.get("/api/me", (req, res) => proxy(req, res, `${listingUrl}/me`));
app.get("/api/admin/stats", (req, res) => proxy(req, res, `${listingUrl}/admin/stats`));

app.use((_req, res) => res.status(404).json({ error: "Gateway route not found" }));

app.listen(port, () => {
  console.log(`Collector API Gateway listening on http://localhost:${port}`);
});

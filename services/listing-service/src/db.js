import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://collector_listing:listing_dev@localhost:5435/collector_listing"
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function initDb() {
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS listings (
          id SERIAL PRIMARY KEY,
          title VARCHAR(120) NOT NULL,
          description TEXT NOT NULL,
          price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
          seller VARCHAR(80) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      return;
    } catch (error) {
      lastError = error;
      console.log(`Listing DB not ready (attempt ${attempt}/30)...`);
      await wait(1500);
    }
  }
  throw lastError;
}

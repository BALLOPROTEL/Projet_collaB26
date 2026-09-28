import pg from "pg";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://collector:collector_dev@localhost:5432/collector";

export const pool = new Pool({ connectionString });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function initDb() {
  let lastError;

  for (let attempt = 1; attempt <= 20; attempt += 1) {
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

      const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM listings");

      if (rows[0].count === 0) {
        await pool.query(
          `INSERT INTO listings (title, description, price_cents, seller)
           VALUES
           ($1, $2, $3, $4),
           ($5, $6, $7, $8),
           ($9, $10, $11, $12)`,
          [
            "Figurine collector vintage",
            "Figurine de démonstration pour le catalogue Collector.shop.",
            4900,
            "collector-demo",
            "Poster dédicacé",
            "Poster de collection utilisé comme donnée de démonstration.",
            7500,
            "collector-demo",
            "Baskets édition limitée",
            "Paire fictive utilisée pour tester le catalogue public.",
            12900,
            "collector-demo"
          ]
        );
      }

      return;
    } catch (error) {
      lastError = error;
      console.log(`Database not ready (attempt ${attempt}/20)...`);
      await wait(1500);
    }
  }

  throw lastError;
}

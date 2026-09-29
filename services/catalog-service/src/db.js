import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://collector_catalog:catalog_dev@localhost:5434/collector_catalog"
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function initDb() {
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS catalog_items (
          id SERIAL PRIMARY KEY,
          source VARCHAR(30) NOT NULL,
          source_id VARCHAR(80) NOT NULL,
          title VARCHAR(120) NOT NULL,
          description TEXT NOT NULL,
          price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
          seller VARCHAR(80) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(source, source_id)
        )
      `);
      const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM catalog_items");
      if (rows[0].count === 0) {
        const seed = [
          ["seed","seed-1","Figurine collector vintage","Figurine de démonstration pour le catalogue Collector.shop.",4900,"collector-demo"],
          ["seed","seed-2","Poster dédicacé","Poster de collection utilisé comme donnée de démonstration.",7500,"collector-demo"],
          ["seed","seed-3","Baskets édition limitée","Paire fictive utilisée pour tester le catalogue public.",12900,"collector-demo"]
        ];
        for (const item of seed) {
          await pool.query(
            "INSERT INTO catalog_items (source, source_id, title, description, price_cents, seller) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING",
            item
          );
        }
      }
      return;
    } catch (error) {
      lastError = error;
      console.log(`Catalog DB not ready (attempt ${attempt}/30)...`);
      await wait(1500);
    }
  }
  throw lastError;
}

export async function projectListing(event) {
  await pool.query(
    `INSERT INTO catalog_items (source, source_id, title, description, price_cents, seller, created_at)
     VALUES ('listing', $1, $2, $3, $4, $5, $6)
     ON CONFLICT (source, source_id) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       price_cents = EXCLUDED.price_cents,
       seller = EXCLUDED.seller`,
    [String(event.id), event.title, event.description, event.price_cents, event.seller, event.created_at]
  );
}

// Quick verification: list tables in the Neon DB
import { readFileSync } from "node:fs";

const url = process.env.POSTGRES_URL;
if (!url) {
  console.error("POSTGRES_URL missing");
  process.exit(1);
}

import("@vercel/postgres").then(async ({ createClient }) => {
  const client = createClient({ connectionString: url });
  await client.connect();
  const r = await client.sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name;
  `;
  console.log("Tables in DB:");
  for (const row of r.rows) console.log(`  ✓ ${row.table_name}`);
  await client.end();
});

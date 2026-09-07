/** One-off: verify admin user rows exist (prints emails, never hashes). */
import fs from "node:fs";
import postgres from "postgres";

let env = {};
for (const l of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = l.match(/^([A-Z_]+)="?([^"]*)"?/);
  if (m && m[2]) env[m[1]] = m[2];
}
const sql = postgres(env.DATABASE_URL, { prepare: false });
const rows = await sql`SELECT id, email, name, role, created_at FROM users ORDER BY id`;
console.log(`users table: ${rows.length} row(s)`);
for (const r of rows) console.log(` - #${r.id} ${r.email} (${r.name || "no name"}, ${r.role})`);
await sql.end();

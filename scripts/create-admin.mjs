/**
 * Creates the first CMS admin user.
 *
 * Usage:
 *   set DATABASE_URL=... && node scripts/create-admin.mjs admin@example.com "Strong Pass" "Name"
 *   (or: npm run admin:create -- admin@example.com "Strong Pass" "Name")
 */
import postgres from "postgres";
import bcrypt from "bcryptjs";
import fs from "node:fs";

// Load .env.local with OVERRIDE priority — this machine has a system-wide
// DATABASE_URL env var pointing at an unrelated Supabase project, which
// must not shadow the project-local configuration.
if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?/);
    if (m && m[2] !== "") process.env[m[1]] = m[2];
  }
}

const [email, password, name] = process.argv.slice(2);

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password> [name]");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Load your .env.local or export it first.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const sql = postgres(process.env.DATABASE_URL, { prepare: false });
const rows = await sql.unsafe(
  `INSERT INTO users (email, password_hash, name, role)
   VALUES ($1, $2, $3, 'admin')
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'
   RETURNING id, email, role`,
  [email.trim().toLowerCase(), hash, name ?? ""]
);
console.log("✔ Admin ready:", rows[0]);
await sql.end();
process.exit(0);

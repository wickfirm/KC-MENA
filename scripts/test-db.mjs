/**
 * Diagnoses the Supabase connection used by the CMS.
 * Usage:  node scripts/test-db.mjs
 * Requires DATABASE_URL in .env.local (or the environment).
 * Never prints the connection string — only pass/fail + error details.
 */
import fs from "node:fs";
import postgres from "postgres";

// Minimal .env.local loader (no dependency on dotenv)
// NOTE: .env.local values OVERRIDE any globally-set environment variable —
// this machine has a system-wide DATABASE_URL pointing at an unrelated
// Supabase project, which must not shadow the project-local one.
if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?/);
    if (m && m[2] !== "") process.env[m[1]] = m[2];
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("✗ DATABASE_URL is not set (add it to .env.local first)");
  process.exit(1);
}

// Show a safe summary of the string structure
let safe = "[unparseable]";
try {
  const u = new URL(url);
  safe = `protocol=${u.protocol} host=${u.host} port=${u.port || "(default)"} db=${u.pathname} user=${u.username} password=${u.password ? "set(" + u.password.length + " chars)" : "MISSING"}`;
} catch {
  safe = "[NOT A VALID URL — check for unencoded special chars like @ in the password]";
}
console.log("Connection string structure:", safe);

const sql = postgres(url, { prepare: false, connect_timeout: 10 });
try {
  const [{ ok, version }] = await sql`SELECT true AS ok, version() AS version`;
  console.log("✓ Connected successfully");
  console.log("  Server:", version.split(",")[0]);
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name`;
  console.log(`  Public tables (${tables.length}):`, tables.map((t) => t.table_name).join(", ") || "NONE — schema.sql not applied yet");
} catch (err) {
  console.log("✗ Connection FAILED");
  console.log("  code:", err.code ?? "(none)");
  console.log("  message:", err.message);
  if (/ENOTFOUND|getaddrinfo/i.test(err.message)) {
    console.log("  → Host not found: check the project-ref/region in the hostname");
  } else if (/password authentication/i.test(err.message)) {
    console.log("  → Wrong password, or it contains unencoded special characters (@ → %40)");
  } else if (/SSL|ssl/i.test(err.message)) {
    console.log("  → Append ?sslmode=require to the connection string");
  } else if (/timeout|ETIMEDOUT/i.test(err.message)) {
    console.log("  → Timed out: are you using the Transaction pooler (port 6543)? Also check Supabase project is not paused");
  }
  process.exitCode = 1;
} finally {
  await sql.end();
}

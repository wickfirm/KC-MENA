// Run the real validateModuleDocument against the saved home content in the DB.
import fs from "node:fs";
import postgres from "postgres";
import { validateModuleDocument } from "./src/lib/content-modules.ts";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?/);
  if (m && m[2] !== "") process.env[m[1]] = m[2];
}
const sql = postgres(process.env.DATABASE_URL, { prepare: false, connect_timeout: 10 });
try {
  const [row] = await sql`SELECT status, content FROM pages WHERE slug = 'home'`;
  const content = typeof row.content === "string" ? JSON.parse(row.content) : row.content;
  console.log("STATUS:", row.status);
  const issues = validateModuleDocument(content);
  console.log("ISSUES:", issues.length);
  for (const issue of issues) console.log(`  - ${issue.path}: ${issue.message}`);
  const rendered = normalizeHomeContent(content);
  const hero = rendered.modules.find((m) => m.id === "hero");
  console.log("RENDERED hero heading:", JSON.stringify(hero?.heading));
} catch (err) {
  console.log("ERROR:", err.message);
} finally {
  await sql.end();
}
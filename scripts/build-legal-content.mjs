/**
 * Build structured legal-page defaults from the client HTML in reference/.
 * Writes src/lib/legal-defaults.json and db/seed-pages.sql.
 *
 *   node scripts/build-legal-content.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const runner = join(root, "scripts", "build-legal-content-run.mts");
const result = spawnSync(process.execPath, ["--experimental-strip-types", runner], { cwd: root, encoding: "utf8" });
if (result.stdout) process.stdout.write(result.stdout);
if (result.status !== 0) {
  process.stderr.write(result.stderr || "Could not build legal content");
  process.exit(result.status ?? 1);
}

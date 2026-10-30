/**
 * Regenerates the legal-page seed from the client HTML in reference/.
 * Legal pages are structured fields now, not an HTML blob.
 *   node scripts/extract-legal.mjs
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const runner = join(process.cwd(), "scripts", "build-legal-content.mjs");
const result = spawnSync(process.execPath, [runner], { stdio: "inherit" });
process.exit(result.status ?? 1);

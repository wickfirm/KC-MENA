import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Regression guard. postgres.js serialises a parameter by the column type the server infers, so
 * `$n::jsonb` + JSON.stringify(...) stores a JSON *string* (double-encoded) instead of an object:
 * saves appear to work but every read returns a string and the editors fall back to defaults.
 * Write JSON parameters as `$n::text::jsonb` (a text parameter parsed by Postgres).
 */
function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".test.ts") ? [full] : [];
  });
}

describe("JSONB parameter casts", () => {
  it("never casts a bound parameter straight to jsonb", () => {
    const offenders = sourceFiles(path.resolve(__dirname, "..")).filter((file) => /\$(\d+|\{[^}]+\})::jsonb/.test(fs.readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});

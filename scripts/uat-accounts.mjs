/**
 * Generates the UAT test accounts (one per role) as SQL with bcrypt HASHES only.
 *
 *   node scripts/uat-accounts.mjs            # writes uat-test-accounts.sql, prints the passwords once
 *
 * Run the SQL in the Supabase SQL Editor. Hand each tester only their own email + password; the passwords
 * exist only in this console output (the SQL file holds hashes). The file is git-ignored. Re-running
 * generates NEW passwords and the SQL resets the existing UAT accounts to them.
 * Remove the accounts after acceptance:  DELETE FROM users WHERE email LIKE '%@uat.kc-mena.invalid';
 */
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import fs from "node:fs";

const ACCOUNTS = [
  { role: "admin", name: "UAT Administrator" },
  { role: "editor", name: "UAT Editor" },
  { role: "contributor", name: "UAT Contributor" },
  { role: "viewer", name: "UAT Viewer" },
];

const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function password() {
  // 16 chars from an unambiguous alphabet; the policy needs letters AND digits, so guarantee one of each.
  const bytes = randomBytes(16);
  let out = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  if (!/\d/.test(out)) out = out.slice(0, 15) + "7";
  if (!/[A-Za-z]/.test(out)) out = "k" + out.slice(1);
  return out;
}

const lines = [
  "-- UAT test accounts (hashes only). Generated " + new Date().toISOString(),
  "-- Remove after acceptance: DELETE FROM users WHERE email LIKE '%@uat.kc-mena.invalid';",
  "",
];
const printed = [];
for (const account of ACCOUNTS) {
  const email = `uat-${account.role}@uat.kc-mena.invalid`;
  const plain = password();
  const hash = await bcrypt.hash(plain, 12);
  lines.push(
    `INSERT INTO users (email, password_hash, name, role, is_active, password_changed_at)`,
    `VALUES ('${email}', '${hash}', '${account.name}', '${account.role}', true, now())`,
    `ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name,`,
    `  role = EXCLUDED.role, is_active = true, password_changed_at = now();`,
    ""
  );
  printed.push({ role: account.role, email, password: plain });
}

fs.writeFileSync("uat-test-accounts.sql", lines.join("\n"), "utf8");
console.log("Wrote uat-test-accounts.sql (hashes only). Passwords, shown once:\n");
for (const a of printed) console.log(`${a.role.padEnd(12)} ${a.email.padEnd(40)} ${a.password}`);
console.log("\nRun the SQL in the Supabase SQL Editor, then share each tester's own login only.");

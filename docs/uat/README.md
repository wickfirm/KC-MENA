# CMS user acceptance testing (UAT)

The CMS is **ready for acceptance testing**, which is not the same as done: nothing counts as tested until a real save has been made in production and checked.

## 1. Create the test accounts (one per role)

```bash
node scripts/uat-accounts.mjs
```

This writes `uat-test-accounts.sql` (bcrypt hashes only, git-ignored) and prints each account's password **once**.
Run the SQL in the Supabase SQL Editor. Give each tester only their own login:

| Role | Email |
|---|---|
| Administrator | `uat-admin@uat.kc-mena.invalid` |
| Editor | `uat-editor@uat.kc-mena.invalid` |
| Contributor | `uat-contributor@uat.kc-mena.invalid` |
| Viewer | `uat-viewer@uat.kc-mena.invalid` |

Remove them after acceptance: `DELETE FROM users WHERE email LIKE '%@uat.kc-mena.invalid';`

## 2. Run the checklist

Import `UAT-CHECKLIST.csv` into Google Sheets (File > Import) and add a data-validation dropdown (Pass / Fail) on the
*Result* column. Each row names the role to use. Mark Pass or Fail and add notes for anything that Fails.

## 3. Report issues in one place

Use one channel only (agree it with the client). Each report: the checklist ID, the role, what was done, what was
expected, what happened, and a screenshot. Retest after each fix, and sign off only when every Essential row is Pass.

## What the checklist deliberately leaves out

Salesforce syncing (waiting for the client's credentials), scheduled publishing, multi-factor sign-in, and Arabic/Japanese
content: none are built yet. See `docs/CMS-PARITY-ANALYSIS.md`.

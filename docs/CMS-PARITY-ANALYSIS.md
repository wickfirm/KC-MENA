# CMS Parity Analysis — KPD (reference) vs KC MENA

Sources compared (read from code, 2026-10-11):

- **Reference:** `ai.withmb/KPD` — Next 15, **Prisma**, Server Actions, `cms-*` CSS (`prisma/schema.prisma`, `src/app/admin/(dashboard)/*`, `src/lib/{auth,versions,activity,submissions}.ts`, `src/components/admin/*`).
- **Target:** this repo — Next 15, **raw SQL** (`query<T>`), route handlers + client editors, inline-style admin (`db/schema.sql`, `src/app/(admin)/admin/*`, `src/app/api/*`).

Status key: ✅ equivalent · 🟡 partial · ❌ missing · ➖ not applicable / not wanted.
Effort: S (< 0.5 day) · M (0.5–2 days) · L (> 2 days).

## 0. Scope guardrails

- **KC MENA is the project; KPD is only a model for the CMS/admin.** Nothing from KPD's public site, design, copy or data model is carried over.
- **The public front-end must remain identical to the client-delivered reference** (the static set the parity work in `docs/HANDOVER-2026-10-10.md` is measured against). Every phase below touches `/admin`, `/api`, `db/` and `src/lib` only, and must not change rendered public HTML, CSS or assets.
- **Acceptance gate for every phase:** before and after screenshots/DOM of the public routes are unchanged, `next build` passes, and any new CMS field that feeds the public page has a default equal to the delivered reference copy (the existing `*-content.ts` defaults pattern).
- New CMS capability is allowed to *expose* more of the delivered page for editing, never to restyle it. Status changes (archive, scheduling, preview) must not alter what an already-published page renders.
- The public site must still degrade gracefully when the database is down.

Port **patterns, not code**. KPD uses Prisma; KC MENA stays on raw SQL (decision recorded in §5).

## 1. Feature comparison

| # | Area | KPD (reference) | KC MENA today | Status | Effort | Notes |
|---|---|---|---|---|---|---|
| 1 | **Roles & permissions** | `requireRole()` guard. ADMIN: everything. EDITOR: content, uploads, submissions, RSS review; **no** settings, users, activity log, media deletion | `role` column and JWT field exist, but **no route checks it** — every editor can do everything | ❌ | M | Highest-risk gap. Add `requireRole()` to `src/lib/auth.ts` and apply to settings, users, media delete, activity |
| 2 | **Live-user re-check** | `requireUser()` re-reads the user row every request; deactivated/deleted accounts are bounced | JWT is trusted until expiry (7 days) | ❌ | S | Needs `is_active` on `users` |
| 3 | **Team management** | `/admin/users`: create, change role, deactivate, reset password, delete. Guards: ≥1 active admin, no self-delete/deactivate | Only `scripts` CLI (`admin:create`) | ❌ | M | New `/admin/users` + `/api/users*` |
| 4 | **Password policy & profile** | `password-rules.ts` (≥10 chars, letters + digits); `/admin/profile` | `/admin/account` password change exists; policy not shared | 🟡 | S | Extract shared rule; apply to create/reset/change |
| 5 | **Audit / activity log** | `ActivityLog` table, `logActivity()` on every mutation + sign-in/out/failed, filter chips, admin-only `/admin/activity` | None | ❌ | M | Best-effort writer that never throws. 18 action types in KPD, reuse the list |
| 6 | **Version history & restore** | `ContentVersion`, last 5 snapshots per entity, FIFO eviction, restore replays through the normal save path (validated, logged). `version-history.tsx` | `page_revisions` written on page edits (unbounded), **no view/restore UI**; news/FAQ/jobs/projects/settings not versioned | 🟡 | M–L | Build UI first (cheap win), then extend to news/projects/settings. Decide keep-N (KPD: 5) |
| 7 | **Dashboard** | "Needs attention" (new messages, pending RSS, failed syncs) + quick actions + recent activity | Count cards (news, pages, FAQs, jobs, unsynced leads, RSS) | 🟡 | S | Add attention list, quick actions, recent activity (after #5) |
| 8 | **Sidebar nav** | Grouped sections with icons + hints, `sidebar-nav`, role badge, skip-link, "My profile" | Flat 22-link list | 🟡 | M | Group: Pages / Content / Inbox / Media / Admin. Hide admin-only items for editors |
| 9 | **Editor shell & UX helpers** | `editor-shell`, `section-nav`/`auto-section-nav` (jump links), `unsaved-guard` (warns on leave), `confirm-button`, `copy-button`, `flash` messages, `list-editor` | Per-page hand-written editors, no shared shell | ❌ | M | `unsaved-guard` + `confirm-button` + flash are the high-value three |
| 10 | **Content status model** | `DRAFT / PUBLISHED / ARCHIVED`; one-click Publish / Unpublish / Archive / Restore-as-draft | News: `draft / in_review / published`; jobs/projects/FAQs: draft/published | 🟡 | S | KC MENA already has `in_review` (KPD doesn't). Add archive + row-level status actions |
| 11 | **List pages** | Search, kind + status filter chips with counts, duplicate, publish/unpublish, "View live ↗" | News list: last 100, status pill only | 🟡 | M | Search, filter chips, duplicate, view-live. Same for projects/jobs/FAQs |
| 12 | **Reorder** | `moveProject`, `moveProjectModule` (up/down) | Check per-entity; no generic mechanism | 🟡 | S | Needed where display order matters (projects, FAQs, jobs) |
| 13 | **News / articles** (cover alt text: n/a — the cover renders as a CSS background, so alt text cannot appear without changing the delivered markup) | Kind (news/blog), summary, paragraph body, cover + **cover alt text**, `publishedAt` rewritten on every publish-save (documented gotcha), RSS-originated link | Category, excerpt, body, cover, in_review state, RSS link | 🟡 | S | Add cover **alt text**; do **not** copy the `publishedAt` rewrite quirk |
| 14 | **RSS pipeline** | Cron every 30 min → pending items → approve (creates *published* article in a transaction) / reject; audited | Manual "Fetch feeds now", sources CRUD, approve creates a **draft** | 🟡 | S | KC MENA's draft-first approval is stricter, keep it. Add Vercel Cron + audit entries |
| 15 | **Submissions (inbox)** | Status `NEW/SYNCED/FAILED`, `details` JSON `[{label,value}]` shown per form, per-row **Retry sync**, `syncError`, dashboard alerts | Read-only table, `sf_sync_status`, `meta` JSON, 250-row cap, no detail view | 🟡 | M | Add detail view, structured details, filters, paging. Retry depends on #16 |
| 16 | **Salesforce dual-write** | `salesforce.ts` OAuth password grant + Lead create; local-first, failure → `FAILED` + 201 | Not built (queued Phase 3); schema already has `sf_*` columns | ❌ | L | Needs client credentials/field mapping (open question Q5) |
| 17 | **Submission workflow** | None beyond status/retry (no assignment, notes) | None | ➖ | — | Neither has assignment/notes; ask the client if wanted (Q4) |
| 18 | **Careers applications** | Enquiry form with "Job Inquiry" type; attachment endpoint `/api/contact/attachment` | Apply form → `/api/submissions` (`type:'career'`, `jobId`); no CV upload | 🟡 | M | CV upload (R2, private) is the real gap. Candidate status not in either |
| 19 | **Media library** | `MediaAsset` (key, url, size, type, uploadedBy), server upload ≤ 25 MB with type allow-list, copy-link, delete **admin-only**, audit | R2 presigned upload, list, delete; `alt` column; no allow-list/limit shown | 🟡 | S–M | Add type/size validation, copy-link, admin-only delete, audit. Folders/crop/focal point are in neither |
| 20 | **Asset picker** | `asset-url-field` (paste or pick URL) | `MediaPicker.tsx` | ✅ | — | Compare behaviour during build |
| 21 | **Pages / blocks** | `StaticPage.content` ordered blocks; fixed pages can't lose slug; editable home, about, invest, legacy | Structured per-page editors (home/about/local/business/contact/listing) + generic `pages` JSON; slug immutable | ✅ | — | KC MENA coverage is arguably wider |
| 22 | **Preview** | `/admin/preview/developments/[slug]` | None | ❌ | M | Draft preview route for pages/news (token- or session-gated) |
| 23 | **Site settings** | `SiteSetting` key/value (contact, floating buttons, booking) | `settings` key `site` drives header/footer/contact drawer | ✅ | — | Settings becomes admin-only via #1 |
| 24 | **SEO fields** | Meta per page (via content audit) | `seo` JSONB on pages | ✅ | — | Confirm every editor exposes it |
| 25 | **Translations** | `*Translation` tables (en/ar/ja), unseeded | None | ➖ | — | Out of scope unless the client asks (Q6) |
| 26 | **Tests** | Vitest on lib pure logic (session, versions, passwords, submissions) | No test tooling | ❌ | S | Add Vitest for the new lib modules only |
| 27 | **Lint** | ESLint 9 flat config | None | ❌ | S | Optional; `next build` is the only check today |
| 28 | **Scheduled publish, MFA, CV/candidate pipeline, analytics reporting** | Not in KPD | Not in KC MENA | ➖ | — | In the original request but absent from the reference, so confirm with the client (Q2, Q4) |

**Read-out:** the reference's advantage is mostly *governance and editor ergonomics* (roles, audit, versions, user management, submission handling), not extra page types. KC MENA already matches or exceeds KPD on page-content coverage.

## 2. Recommended phases

Each phase ships independently and keeps `next build` green.

### Phase A — Governance foundation (do first; everything else logs/guards through it)
1. `users.is_active`, `last_login_at`; `requireUser()` + `requireRole()` in `src/lib/auth.ts` (rows 1–2).
2. `activity_log` table + `logActivity()` + `/admin/activity` (admin only) (row 5).
3. `/admin/users` + API, shared password policy, last-admin/self-delete guards (rows 3–4).
4. Apply role gates: settings, users, activity, media delete are admin-only.
5. Vitest + unit tests for guards, password rules, activity writer (row 26).

### Phase B — Editorial safety
1. Version history UI + restore for pages (data already exists), then extend to news, projects, settings with keep-5 (row 6). Built: keep-10 per record.
2. `unsaved-guard`, `confirm-button`, flash messages, section-nav shared components (row 9).
3. Row-level status actions (publish/unpublish/archive/restore) and duplicate; search and filter chips on list pages (rows 10–12).
4. ~~News cover alt text~~ dropped (see row 13). Archive status deferred: it needs CHECK-constraint changes and a client decision.

### Phase C — Inbox & integrations (built; Salesforce awaits client credentials and field mapping; structured per-field `details` not built — the forms already write "Label: value" lines into the message, shown verbatim in the detail view)
1. Submission detail view, structured details, filters/paging (row 15).
2. Salesforce dual-write + per-row Retry sync + dashboard alerts (rows 16, 7). Blocked on credentials.
3. Career CV upload to private R2 storage (row 18).
4. RSS cron + audit entries (row 14).

### Phase D — Polish (built; page previews already existed under /preview/*, news preview added)
1. Grouped sidebar, role badge, dashboard "needs attention" and quick actions (rows 7–8).
2. Media: validation, copy-link, audit (row 19).
3. Draft preview route (row 22).

Dependencies: A → B and C (audit + role guards). C2 depends on client credentials. D is independent.

## 3. Decisions needed from the client (replaces the long handover request)

The original `CMS-REFERENCE-HANDOVER-REQUEST.md` asked for a full feature inventory, which we can now read from KPD. What is left is *intent*:

| # | Question |
|---|---|
| Q1 | Is **KPD's CMS the reference**, as assumed here, or is there a third, more advanced system? |
| Q2 | Roles: is **Admin / Editor** enough, or is a separate **approver/publisher** needed (KC MENA has an `in_review` state; KPD does not)? Who are the named users? |
| Q3 | Version history: is **last 5 versions** acceptable (KPD's client work order)? |
| Q4 | Submissions: do they need **assignment, internal notes, status beyond new/synced/failed**, email notifications, CSV export? Careers: CV handling and candidate status? |
| Q5 | **Salesforce**: credentials, object (Lead), field mapping, who owns retries? |
| Q6 | **Arabic / Japanese** content planned for the CMS? (KPD stubs translation tables.) |
| Q7 | Scheduled publishing, MFA, analytics/reporting: needed now, later, or never? |
| Q8 | Admin UI labels the client wants kept exactly (KPD-style "Messages", "Team", "News inbox" vs current "Submissions", "RSS Pipeline"). |

## 4. Acceptance criteria (per phase, draft)

- **A:** An editor gets a redirect with a denial message on `/admin/users`, `/admin/settings`, `/admin/activity` and on media deletion; a deactivated user's existing session is rejected on the next request; the last active admin cannot be demoted, deactivated or deleted; every create/update/delete/sign-in writes one activity row; `next build` and the unit tests pass.
- **B:** Editing and saving a page six times leaves exactly five restorable versions; restoring writes a new save and an activity entry; leaving an edited form prompts; list pages filter by status and search by title.
- **C:** A submission shows every field the visitor filled in; a failed Salesforce push leaves the local record and marks it failed; Retry succeeds once credentials are valid; a CV uploaded on the Apply form is stored privately and linked on the submission.
- **D:** Sidebar groups and hides admin-only items for editors; dashboard lists items needing attention.

## 5. Constraints & decisions to confirm

1. **Stay on raw SQL.** No Prisma migration. Schema changes go in `db/schema.sql` as idempotent `ALTER TABLE ... IF NOT EXISTS` plus a small migration file for the Supabase SQL editor (same workflow as today).
2. **Mutation layer.** KPD uses Server Actions; KC MENA uses route handlers. Keep route handlers for consistency (they already re-verify the session per route); do not mix patterns without a reason.
3. **KPD's own AGENTS.md is stale** on roles ("no role-based authorization"). The code, `requireRole()` in `src/lib/auth.ts`, and the "work order 2026-10" comment are authoritative.
4. **Don't copy KPD's quirks:** the `publishedAt` rewrite on every re-save, slug collisions surfacing as raw DB errors, and the per-file `slugify()`.
5. Public-site resilience rules (graceful DB failure) are unchanged by any of this.

---

# Round 2: look & feel, UX and handover (re-read of the latest KPD)

**Correction to §1.** Round 1 compared KC MENA with KPD's local `main`, which is 17 commits behind. The
latest KPD is `origin/main` @ `686fd0c` (checked out at `KPD/.claude/worktrees/legacy-page-styling-7e559e`).
It adds roles/permissions, previews of unsaved changes, drag-and-drop reordering, captions, a restyle, a
loading shell and an in-CMS guide. Round 1 also left "Visual consistency material" (§5 of the original
handover request) out of scope; this section closes that.

| # | KPD latest | KC MENA now | Gap | Effort |
|---|---|---|---|---|
| E1 | **Four roles** (ADMIN, EDITOR, CONTRIBUTOR, VIEWER) from one pure `src/lib/permissions.ts`: `can(role, perm)`, `canViewPath`, `mayEditContent`, `allowedStatus`; 11 permissions. Contributors write drafts only; Viewers read-only; only Admin deletes | 2 roles, ad-hoc `denyUnless([...])` in ~8 routes | Replace with a permissions module; a `requirePermission` on **every** write route (the KPD recap notes their API routes only checked "signed in" until fixed); role CHECK on `users.role` to widen | M |
| E2 | `data-requires="publish\|delete"` on controls, hidden by role classes set in the layout | Editors/Viewers see buttons they cannot use (they get 403) | Add attribute + layout role class + CSS | S |
| E3 | **Preview with unsaved changes** on every editor that goes live on save: one throw-away draft row per user per page (2 h expiry, never public), admin-only preview route overlays it on saved content; page markup lives in shared view components | Previews show *saved* content only (`/preview/*`, `/preview/news/:id`) | Draft-preview table/rows, `previewDraft` endpoint + "Preview" button in each editor, overlay in the existing preview routes | M–L |
| E4 | Drag-and-drop reorder (`useDragReorder`, handle-only, keyboard Move up/down kept) for gallery images and repeatable cards | No reordering in the repeater editors (Home, About, Local Business, Business, Contact, Listing) | Shared hook + apply to each repeater | M |
| E5 | Per-image captions stored with the image (`gallery-content.ts`, paired before blank rows are dropped, unit-tested) | Captions only where the delivered markup already has them | Only where the **delivered** pages show captions; do not add UI the front-end can't render | S–M |
| E6 | **Speed:** `loading.tsx` shell with a progress bar, cached per-request user lookup, parallel queries | No `loading.tsx`; **my Phase A made it worse**: `getSession()` queries the DB on every call, uncached, several times per page | Wrap in React `cache()`, add `loading.tsx`, `Promise.all` the dashboard/list queries | S |
| E7 | **Visual identity:** admin.css on a token system matched to the client's site (measured, black/white, Figtree, square cards, pill buttons), real horizontal logo in the sidebar, labelled-rule section headers, consistent list/editor pattern | Inline-style admin; text "KC MENA" in the sidebar; `globals.css` basics | Measure KC MENA's CSS first (site tokens: `--black #0a0a0a`, greys, `--accent-red #a6192e`, Figtree + Noto Serif), then tokens → sweep inline colours → real logo (`public/images/kasumigaseki-logo.svg`, wordmark KME) | L |
| E8 | Hydration safety: delivered HTML injected via `dangerouslySetInnerHTML` is balanced and LF-normalised (`html-lf.ts`) | KC MENA renders delivered pages as React routes, so this mostly does not apply | Verify only; add an LF check if raw HTML fields are ever introduced | S |
| E9 | New developments appear automatically in menu/footer | Header/footer are settings-driven; projects render in a band | Not applicable | none |
| E10 | **Handover/UAT:** in-CMS Guide page (279 lines: per role, preview, galleries, removing things), UAT test accounts per role (SQL, bcrypt), checklist sheet with Pass/Fail, client email, single issue channel | None | Write guide page, test-account SQL, checklist, email | M |
| E11 | Rendered-text comparison of live vs local `<main>` after any view extraction | I extracted `NewsArticleView` and diffed source only | Compare rendered `<main>` of one live article and `/careers` before/after | S |
| E12 | Lessons: Supabase pooler "can't reach DB" can mean wrong password (add `sslmode=require`); Vercel deploy can sit in "Deploying outputs…" 10+ min; don't say "tested" until real production saves | n/a | Add to AGENTS.md gotchas | S |

## Proposed Phase E order
1. **E6 speed** (fixes my regression).
2. **E1 + E2 permissions**, then roles in the Team screen and activity labels.
3. **E3 unsaved-changes preview**, starting with News and Home (highest use).
4. **E4 drag reorder**, then **E5 captions** only where the front-end shows them.
5. **E7 visual pass** (measure → tokens → logo), after behaviour is stable so it is reviewed once.
6. **E10 guide + UAT package**, **E11 rendered-text check**, **E12 gotchas**.

## Decisions for the client
- Are the **four KPD roles** wanted for KC MENA, or only Admin/Editor? (KPD's client work order defined them.)
- Should the KC MENA admin share KPD's exact UI (Figtree/Inter, pill buttons, `Messages`/`Team`/`News inbox` labels) or the KC MENA site's own look?

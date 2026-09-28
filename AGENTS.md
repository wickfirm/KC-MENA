# AGENTS.md — KC MENA Website + Custom CMS

Kasumigaseki Capital MENA corporate site: Next.js 15 (App Router, TypeScript, React 19) with a
ground-up custom CMS console, PostgreSQL on Supabase, media on Cloudflare R2. No third-party CMS,
no UI library, no test/lint tooling.

- Deeper docs: [`README.md`](README.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`db/schema.sql`](db/schema.sql)
- Phase state: Phase 1 ✅ (architecture, schema, auth, admin skeleton) · Phase 2 ✅ (all 14 public
  pages are CMS-driven Next routes — no page relies on the static rewrite fallback) · Phase 3
  partially done: RSS ingest → review → approve-to-News is live; Salesforce dual-write still queued.
- **Handoff-completeness pass done:** projects render publicly, sector-pages admin removed
  (structured business editors only), site settings drive header/footer/contact drawer, careers
  Apply posts to `/api/submissions`, listing-page shells (careers/faq/news) are CMS-editable under
  `/admin/site/listing/*`. See the map below for what is still in-code default vs DB-editable.

## Commands

```bash
npm run dev                   # local dev (http://localhost:3000)
npm run build                 # production build (also the only type check)
npm start                     # serve production build
npm run admin:create -- you@example.com "StrongPassword" "Your Name"   # upsert CMS admin
node scripts/test-db.mjs      # diagnose the Supabase connection (never prints the URL)
node scripts/check-users.mjs  # list CMS users (same env-loading as test-db)
node scripts/extract-legal.mjs # regenerate db/seed-pages.sql from public/ static HTML
node scripts/build-content-audit.mjs # rebuild KC-Content-Review/ (audit xlsx + google-doc-templates/*.docx; needs `npm i --no-save exceljs docx`)
```

- **There is no lint/test/typecheck script and no ESLint/Prettier config.** Type errors surface
  only via `next build` (or `npx tsc --noEmit`). Node >= 20.
- Apply schema/seed via the Supabase dashboard SQL Editor (`db/schema.sql`, then
  `db/seed-faqs.sql`, `db/seed-pages.sql`). Don't run `psql` on the pooler string.

## Environment

All in `.env.local` (copy `.env.example`). `DATABASE_URL`, `AUTH_SECRET` (min 16 chars), `R2_*`.

- `DATABASE_URL` must be the Supabase **transaction pooler** string (port 6543). The DB driver sets
  `prepare: false` because that pooler requires it — keep that option when writing SQL scripts.
- **Gotcha:** the dev machine has a system-wide `DATABASE_URL` pointing at an unrelated Supabase
  project. The `scripts/*.mjs` files manually parse `.env.local` with override priority so the
  project-local value wins. Never delete that loader; rely on it instead of `dotenv`/shell env.
- R2 is wired for uploads (presigned, browser → R2 direct) and `/admin/media` lists/deletes objects.

## Architecture

```
src/app/(site)/    public pages — own <html> layout (header, footer, ContactDrawer)
src/app/(admin)/   /admin console — separate layout, sidebar nav, auth-protected
src/app/(auth)/    /admin/login
src/app/api/       route handlers, one per resource (auth, pages, news, faqs)
src/lib/           db.ts (query helpers), auth.ts (JWT), pages.ts, r2.ts, slug.ts
src/components/    site/ + admin/ shared components
public/            the delivered static site (legacy fallback only — every page is a Next route now)
db/                schema.sql + seed files
```

- **Zero-downtime migration via rewrites.** `next.config.mjs` rewrites `/:path*` →
  `/:path*/index.html`, so unmatched routes serve the delivered static site in `public/`. A rebuilt
  Next.js route takes precedence over the rewrite. When you build a new page, it simply overrides
  the static one — the old HTML stays as fallback.
- `(site)` and `(admin)` layouts each render their own `<html>`; the root `app/layout.tsx` is only
  a pass-through (globals.css). The site layout links `/css/site.css` and `/js/site.js`
  **from `public/`** — rebuilt pages must mirror the static markup's class names/IDs so that
  shipped CSS and vanilla JS still work (see `ContactDrawer` and `LegalPageView` comments).
- Every DB-driven public page exports `dynamic = "force-dynamic"` (no static generation).

## Data access & API conventions

- Use `query<T>(sql, params)` / `queryOne<T>` from `src/lib/db.ts` (parameterized `$1` placeholders).
  JSONB columns: `JSON.stringify(...)` in params + `$n::jsonb` cast in SQL. Never interpolate.
- Route handlers: `export const dynamic = "force-dynamic"`, re-verify session with `getSession()`
  (middleware is NOT enough — the server re-checks per route), return
  `{ error }` + proper status, wrap DB in try/catch with `console.error` + 500.
- **Next 15 async params:** dynamic route handlers/pages receive
  `ctx: { params: Promise<{ id: string }> }` — `await` it. Don't add `context`/`searchParams` sync access.
- Public-site DB failures must degrade gracefully: catch the query and render the design sections
  anyway (news listing does this; `getPageBySlug` returns null on error; admin shows a
  "Database not connected" card). The public site must never 500 because Supabase is down.
- `pages` slugs are validated with `SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/` on the API and are
  **immutable after creation** ("Slug cannot be changed (links would break)"). News slugs use
  `slugify()` from `src/lib/slug.ts`.
- Editing a page snapshots the previous version into `page_revisions` before updating (`PUT /api/pages/:id`).
- Legal pages live in `pages.content` as JSONB `{ meta: html, body: html }` (`meta` = "last updated"
  aside). Seeds are generated straight from the static HTML and use `ON CONFLICT DO NOTHING` —
  they never overwrite CMS edits.

## Auth

Custom JWT auth (jose, HS256) + bcrypt (cost 12) credentials in the `users` table. Session is an
`httpOnly`, `SameSite=Lax` cookie `kc_session`, 7-day TTL. `src/middleware.ts` guards `/admin/*`
except `/admin/login` (redirects with `?next=`). Roles: `admin` / `editor`.

## UI conventions

- Admin console: hand-rolled — inline `style={{}}` objects plus shared classes from
  `src/app/globals.css` (`.card`, `.btn`, `.btn-dark`, `.status-pill status-*`). Match existing
  patterns; don't reach for a component library.
- `"use client"` only where interactivity is required (`LogoutButton`, `FaqRowActions`,
  `ContactDrawer`). **Gotcha:** the site-wide `ContactDrawer` must stay a client component — an
  `onSubmit` handler in a server component previously 500'd every public page (commit 6d425a7).
- Public page styles: shared layout comes from `/css/site.css` (public); per-page extras are
  route-scoped CSS files imported in the page (`news/news.css`, `faq/faq.css`). Reused design
  classes: `.wrap`, `.section`, `.hero-band`, `.eyebrow`, `.legal-hero`, `.legal-content`,
  `.news-grid`, `.news-card`, `.insight-grid`, `.disclaimer`, CSS vars `--ink`, `--grey-5/6`, `--line`.
- Canonical domain is hardcoded as `https://kasumigaseki.ae/...` in metadata — keep it consistent.

## Phase-aware map (what to touch vs. what's placeholder)

- All 14 public pages are Next routes: `/` (home), `/about-us`, `/global-businesses`,
  `/local-business`, `/real-estate`, `/real-estate-development`, `/f-and-b`, `/careers`, `/contact-us`,
  `/news` + `/news/[slug]`, `/faq`, plus the four legal pages. The `next.config.mjs` rewrite to
  `public/` is still in place as a safety net, but nothing falls through to it.
- Editable page content: home/about/local-business/contact + 4 business pages (structured editors
  under `/admin/site/*`), listing-page shells `/admin/site/listing/{careers,faq,news}` (hero,
  heading, intro, empty-state; news also featured-video band, insight cards, disclaimer), news /
  FAQs / jobs / projects / media full CRUD, `/admin/settings` drives header nav, footer brand
  block, contact details, and ContactDrawer locations (`settings` table, key `site`, via
  `src/lib/settings.ts` — falls back to in-code defaults when the DB is down).
- Projects render publicly in a band on the 5 business pages (`getPublishedProjectsBySector`,
  `ProjectsSection`) — nothing shows when a sector has no published projects.
- Careers "Apply" opens an inline form (`JobApplyForm`) posting to `/api/submissions` with
  `type:'career'` + `jobId`; the ContactDrawer form also POSTs to `/api/submissions`.
- RSS pipeline is live: `/admin/rss` → "Fetch feeds now" (`POST /api/rss/ingest`, dependency-free
  RSS/Atom parser in `src/lib/rss.ts`) → review queue → Approve creates a **draft** news post
  (source `rss`, `rss_item_id` set) that editors publish from `/admin/news`; Reject hides the item.
- Still queued (Phase 3): Salesforce dual-write for `contact_submissions`. Also in-code only:
  seed defaults for listing pages / settings (no seed rows), `page_revisions` has no view/restore UI,
  submissions are read-only.
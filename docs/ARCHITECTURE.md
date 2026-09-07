# KC MENA — CMS Architecture & Data Models

**Project:** Kasumigaseki Capital MENA website + custom CMS platform
**Contract phase:** Phase 1 deliverable (CMS architecture, page inventory, data models)
**Hosting:** Vercel · **Database:** Supabase (PostgreSQL) · **Stack:** Next.js (App Router, TypeScript) + custom-built admin

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VISITORS                             │
│   kasumigaseki.ae — Next.js pages (migrated from static)    │
└───────────────┬──────────────────────────┬──────────────────┘
                │ reads                    │ form POSTs
┌───────────────▼──────────────────────────▼──────────────────┐
│                     VERCEL (Next.js)                        │
│  • Public pages      • /api/forms  (submissions endpoint)   │
│  • /admin console    • /api/rss    (ingest + moderation)    │
│  • JWT auth (jose) + bcrypt credentials in `users` table    │
│  • next.config rewrites serve legacy static pages until     │
│    each is rebuilt as a Next route (zero-downtime migration)│
└───────────────┬──────────────────────────┬──────────────────┘
                │                          │
     ┌──────────▼──────────┐    ┌──────────▼───────────┐
     │  SUPABASE           │    │   SALESFORCE         │
     │  PostgreSQL         │◄──►│   dual-write API     │
     │  13 tables (below)  │    │   (leads, careers)   │
     │  single source of   │    │   status-tracked     │
     │  truth for content  │    │                      │
     └─────────────────────┘    └──────────────────────┘
```

**Key decisions**
- **Ground-up custom admin** (`/admin`): own auth, own UI, no third-party CMS dependency — matches contract wording and IP assignment (Clause 7: source code, CMS configurations, database structures all transfer to client).
- **Dual-write**: every form submission is persisted locally first, then written to Salesforce; `sf_sync_status` (`pending`/`synced`/`failed`) + `sf_record_id` give auditing and retry capability. A failed Salesforce write never loses a lead.
- **RSS moderation pipeline**: feeds → `rss_items` (status `pending`) → editor approves → becomes a `news_posts` row (`source='rss'`). Nothing publishes unreviewed.
- **Media storage — Cloudflare R2** (S3-compatible): uploads are presigned by a Next API route and go **browser → R2 directly** (large media never passes through the serverless function). Public objects are served via the bucket's CDN domain and registered in `media_assets` with their public URL. Zero egress fees.
- **Incremental migration**: `next.config.mjs` rewrites clean URLs to the delivered static pages in `public/`; as each page is rebuilt in Phase 2, the Next route automatically takes precedence.

## 2. Page Inventory (14 pages)

| # | Route | Source of truth | CMS model | Notes |
|---|-------|-----------------|-----------|-------|
| 1 | `/` | static → Phase 2 | `pages.content` (JSONB) | homepage blocks, CTAs |
| 2 | `/about-us` | static → Phase 2 | `pages.content` | |
| 3 | `/global-businesses` | static → Phase 2 | `pages.content` + `projects` | sector = `global-businesses` |
| 4 | `/local-business` | static → Phase 2 | `pages.content` + `projects` | sector = `local-business` |
| 5 | `/real-estate` | static → Phase 2 | `pages.content` + `projects` | sector = `real-estate` |
| 6 | `/real-estate-development` | static → Phase 2 | `pages.content` + `projects` | sector = `real-estate-development` |
| 7 | `/f-and-b` | static → Phase 2 | `pages.content` + `projects` | sector = `f-and-b` |
| 8 | `/news` | static → Phase 2 | `news_posts` | manual + RSS-sourced |
| 9 | `/careers` | static → Phase 2 | `job_openings` | applications → `contact_submissions` |
| 10 | `/contact-us` | static → Phase 2 | form only | submissions → Salesforce dual-write |
| 11 | `/faq` | **new build** | `faqs` | build + copywriting in scope |
| 12 | `/privacy-policy` | static → Phase 2 | `pages.content` | text from client's legal counsel |
| 13 | `/terms-and-conditions` | static → Phase 2 | `pages.content` | text from client's legal counsel |
| 14 | `/legal-notice` · `/cookie-policy` | static → Phase 2 | `pages.content` | same wiring as 12–13 |

## 3. Data Models (`db/schema.sql`)

| Table | Purpose | Key fields |
|-------|---------|-----------|
| `users` | CMS accounts | email, password_hash (bcrypt), role (`admin`/`editor`) |
| `pages` | Structured page content (legal, business pages, home) | slug, status, content JSONB, seo JSONB |
| `page_revisions` | Full edit history, restorable | page_id, content, created_by/at |
| `news_posts` | News articles | slug, status (`draft`/`in_review`/`published`), source (`manual`/`rss`), published_at |
| `rss_sources` | Feed registry | url, is_active |
| `rss_items` | Moderation queue | guid, status (`pending`/`approved`/`rejected`), reviewer, link → news_post_id |
| `faqs` | FAQ page entries | question, answer, category, sort_order, is_published |
| `projects` | Sector listings | sector (5 values), images JSONB, metadata JSONB, sort_order |
| `job_openings` | Careers listings | status (`open`/`closed`/`draft`), closing_date |
| `contact_submissions` | All form leads | type (`contact`/`enquiry`/`career`/`newsletter`), **sf_sync_status**, **sf_record_id** |
| `media_assets` | Uploads registry (files stored in **Cloudflare R2**) | url, filename, mime, alt, uploaded_by |
| `settings` | Global key/value config | key, value JSONB |

## 4. Auth & Security

- Credentials login → `bcrypt` verify → JWT (`jose`, HS256) in an **httpOnly, SameSite=Lax** cookie (7-day expiry).
- `src/middleware.ts` protects all `/admin/*` except `/admin/login`; every API route independently re-verifies the session.
- Secrets live only in env vars (`DATABASE_URL`, `AUTH_SECRET`) — never committed; `.env.example` documents both.

## 5. Phased Delivery Map (per contract Clause 4)

| Phase | Scope | Status |
|-------|-------|--------|
| 1 — Architecture, inventory, data models | this document + `db/schema.sql` | ✅ delivered |
| 2 — Template build-out & CMS administration | migrate 14 pages to Next templates; build editors for pages/news/FAQ/projects/jobs; media library | next |
| 3 — Integrations | Salesforce dual-write (`/api/forms` + sync worker); RSS ingest/approval pipeline | queued |
| 4 — Content refresh, QA, CMS training | copywriting pass, cross-page QA, client training session | queued |
| 5 — Buffer & go-live | final sign-off, go-live | queued |


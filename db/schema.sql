-- ============================================================
-- KC MENA — CMS Database Schema (Phase 1: architecture & data models)
-- Target: Vercel Postgres (Neon) — PostgreSQL 16
-- Apply:  psql $DATABASE_URL -f db/schema.sql
--         (or via Vercel dashboard → Storage → Query)
-- ============================================================

-- ---------- AUTH ----------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'editor'
                CHECK (role IN ('admin', 'editor')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- CMS CORE: structured pages ----------
-- Powers: About Us, Global Businesses, Local Business, Real Estate,
-- Real Estate Development, F&B, Privacy Policy, Cookie Policy,
-- Legal Notice, Terms & Conditions (content supplied by client's
-- legal counsel), and the new FAQ page.
CREATE TABLE IF NOT EXISTS pages (
  id         SERIAL PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,          -- e.g. 'about-us', 'privacy-policy'
  title      TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  content    JSONB NOT NULL DEFAULT '{}'::jsonb,  -- structured sections (hero, blocks, ctas)
  seo        JSONB NOT NULL DEFAULT '{}'::jsonb,  -- {title, description, og_image}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS page_revisions (
  id         SERIAL PRIMARY KEY,
  page_id    INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  content    JSONB NOT NULL,
  seo        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_page_revisions_page ON page_revisions(page_id, created_at DESC);

-- ---------- NEWS (manual + RSS pipeline) ----------
CREATE TABLE IF NOT EXISTS news_posts (
  id           SERIAL PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT NOT NULL DEFAULT '',
  body         TEXT NOT NULL DEFAULT '',
  cover_image  TEXT,
  category     TEXT,
  status       TEXT NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft', 'in_review', 'published')),
  source       TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'rss')),
  rss_item_id  INTEGER,                     -- set when created from approved RSS item
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by   INTEGER REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_news_status   ON news_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_posts(category);

-- RSS moderation pipeline (Phase 3): ingest → review → approve/reject
CREATE TABLE IF NOT EXISTS rss_sources (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  url        TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rss_items (
  id           SERIAL PRIMARY KEY,
  source_id    INTEGER NOT NULL REFERENCES rss_sources(id) ON DELETE CASCADE,
  guid         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  link         TEXT NOT NULL,
  summary      TEXT,
  published_at TIMESTAMPTZ,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by  INTEGER REFERENCES users(id),
  reviewed_at  TIMESTAMPTZ,
  news_post_id INTEGER REFERENCES news_posts(id),
  fetched_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rss_items_status ON rss_items(status, fetched_at DESC);

-- ---------- FAQ (new page — build + copywriting in scope) ----------
CREATE TABLE IF NOT EXISTS faqs (
  id           SERIAL PRIMARY KEY,
  question     TEXT NOT NULL,
  answer       TEXT NOT NULL,
  category     TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- BUSINESS STRUCTURE ----------
CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  sector      TEXT NOT NULL CHECK (sector IN
              ('real-estate', 'real-estate-development', 'f-and-b',
               'local-business', 'global-businesses')),
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  location    TEXT,
  summary     TEXT,
  description TEXT,
  images      JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,  -- sector-specific fields
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector, sort_order);

CREATE TABLE IF NOT EXISTS job_openings (
  id           SERIAL PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  department   TEXT,
  location     TEXT,
  employment   TEXT,                        -- full-time / part-time / contract
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  closing_date DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- LEADS / FORMS (Salesforce dual-write — Phase 3) ----------
-- Front-end forms currently fall back to mailto:. They will POST here;
-- every submission is persisted in Postgres AND written to Salesforce
-- (dual-write). Sync state is tracked for retries/auditing.
CREATE TABLE IF NOT EXISTS contact_submissions (
  id             SERIAL PRIMARY KEY,
  type           TEXT NOT NULL DEFAULT 'contact'
                 CHECK (type IN ('contact', 'enquiry', 'career', 'newsletter')),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT,
  subject        TEXT,
  message        TEXT,
  meta           JSONB NOT NULL DEFAULT '{}'::jsonb,  -- page source, job ref, etc.
  sf_sync_status TEXT NOT NULL DEFAULT 'pending'
                 CHECK (sf_sync_status IN ('pending', 'synced', 'failed')),
  sf_record_id   TEXT,
  sf_synced_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subs_sf   ON contact_submissions(sf_sync_status);
CREATE INDEX IF NOT EXISTS idx_subs_date ON contact_submissions(created_at DESC);

-- ---------- MEDIA LIBRARY ----------
CREATE TABLE IF NOT EXISTS media_assets (
  id          SERIAL PRIMARY KEY,
  url         TEXT NOT NULL,
  filename    TEXT NOT NULL,
  mime_type   TEXT,
  size_bytes  BIGINT,
  alt         TEXT,
  uploaded_by INTEGER REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- GLOBAL SETTINGS ----------
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);




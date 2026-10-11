-- Phase B — editorial safety: rolling content version history (restorable).
-- Idempotent. Run in the Supabase SQL Editor before deploying the code that uses it.
-- Versions are recorded AFTER each successful save; the app keeps the newest 10 per record.

CREATE TABLE IF NOT EXISTS content_versions (
  id             BIGSERIAL PRIMARY KEY,
  entity_type    TEXT        NOT NULL,   -- page | news | faq | project | job | settings
  entity_id      TEXT        NOT NULL,   -- pages: slug · settings: key · others: numeric id
  version_number INTEGER     NOT NULL,
  label          TEXT        NOT NULL,
  snapshot       JSONB       NOT NULL,   -- editable columns only (see src/lib/versions.ts)
  author_id      INTEGER,                -- no FK: versions outlive deleted users
  author_email   TEXT,
  author_name    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_content_versions_entity ON content_versions(entity_type, entity_id, version_number DESC);

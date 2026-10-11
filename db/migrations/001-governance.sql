-- Phase A — governance: account lifecycle + audit trail.
-- Idempotent. Run in the Supabase SQL Editor BEFORE deploying the code that uses it
-- (login and session checks read users.is_active).

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active           BOOLEAN     NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at      TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS activity_log (
  id          BIGSERIAL PRIMARY KEY,
  action      TEXT        NOT NULL,            -- e.g. 'content.save', 'user.create' (see src/lib/activity.ts)
  summary     TEXT        NOT NULL,
  actor_id    INTEGER,                          -- no FK: entries must outlive deleted users
  actor_email TEXT,
  actor_name  TEXT,
  entity_type TEXT,
  entity_id   TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_action  ON activity_log(action, created_at DESC);

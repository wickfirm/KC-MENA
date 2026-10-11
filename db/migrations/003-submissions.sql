-- Phase C — submissions: Salesforce sync error detail (CV metadata lives in the existing meta JSONB).
-- Idempotent. Run in the Supabase SQL Editor before deploying.

ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS sf_error TEXT;

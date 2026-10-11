-- Four roles: admin, editor, contributor, viewer (was admin/editor only).
-- Idempotent. Run in the Supabase SQL Editor before deploying the code that creates contributor/viewer users.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'editor', 'contributor', 'viewer'));

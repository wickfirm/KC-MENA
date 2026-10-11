-- Repair: JSON saved as a text STRING instead of an object.
--
-- Cause: the API passed JSON.stringify(...) with a plain `$n::jsonb` cast; the driver then encoded the
-- string a second time, so jsonb_typeof(col) = 'string'. Reads returned a string, the editors fell back
-- to their defaults and saved SEO/content "disappeared" on refresh. The code now uses `$n::text::jsonb`.
--
-- Idempotent: only touches values that are strings containing a JSON object/array. Run in the Supabase
-- SQL Editor. Safe to re-run.

UPDATE pages              SET content = (content #>> '{}')::jsonb  WHERE jsonb_typeof(content)  = 'string' AND (content #>> '{}') ~ '^\s*[\[{]';
UPDATE pages              SET seo     = (seo #>> '{}')::jsonb      WHERE jsonb_typeof(seo)      = 'string' AND (seo #>> '{}')     ~ '^\s*[\[{]';
UPDATE page_revisions     SET content = (content #>> '{}')::jsonb  WHERE jsonb_typeof(content)  = 'string' AND (content #>> '{}') ~ '^\s*[\[{]';
UPDATE page_revisions     SET seo     = (seo #>> '{}')::jsonb      WHERE jsonb_typeof(seo)      = 'string' AND (seo #>> '{}')     ~ '^\s*[\[{]';
UPDATE content_versions   SET snapshot = (snapshot #>> '{}')::jsonb WHERE jsonb_typeof(snapshot) = 'string' AND (snapshot #>> '{}') ~ '^\s*[\[{]';
UPDATE settings           SET value   = (value #>> '{}')::jsonb    WHERE jsonb_typeof(value)    = 'string' AND (value #>> '{}')   ~ '^\s*[\[{]';
UPDATE contact_submissions SET meta   = (meta #>> '{}')::jsonb     WHERE jsonb_typeof(meta)     = 'string' AND (meta #>> '{}')    ~ '^\s*[\[{]';
UPDATE projects           SET images  = (images #>> '{}')::jsonb   WHERE jsonb_typeof(images)   = 'string' AND (images #>> '{}')  ~ '^\s*[\[{]';
UPDATE projects           SET metadata = (metadata #>> '{}')::jsonb WHERE jsonb_typeof(metadata) = 'string' AND (metadata #>> '{}') ~ '^\s*[\[{]';
UPDATE activity_log       SET metadata = (metadata #>> '{}')::jsonb WHERE jsonb_typeof(metadata) = 'string' AND (metadata #>> '{}') ~ '^\s*[\[{]';

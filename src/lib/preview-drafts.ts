import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Permission } from "@/lib/permissions";

/**
 * "Preview with unsaved changes". The editor posts exactly what it would have saved; instead of
 * writing to the page it is parked as one throw-away row per user per page (in `settings`, key
 * `preview:<userId>:<previewKey>`), expiring after two hours. Only the session-guarded /preview/*
 * routes ever read it, so nothing public changes and nothing is saved.
 */
export const DRAFT_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export type PreviewTarget = {
  /** Identifies the page inside the user's draft key. */
  key: string;
  /** The /preview route that renders the draft. */
  url: string;
  /** Permission needed to preview (same as to edit it). */
  permission: Permission;
};

const SITE_PAGE = /^\/api\/site-pages\/(home|about|local-business)$/;
const SITE_PAGE_SLUG = /^\/api\/site-pages\/(business|listing)\/([a-z0-9-]+)$/;
const NEWS = /^\/api\/news(?:\/(\d+))?$/;

/** Map the save endpoint an editor was about to call to its preview route, or null when unsupported. */
export function previewTarget(path: string): PreviewTarget | null {
  let m = SITE_PAGE.exec(path);
  if (m) return { key: `page:${m[1]}`, url: `/preview/${m[1]}?draft=1`, permission: "content.editLive" };
  m = SITE_PAGE_SLUG.exec(path);
  if (m) return { key: `page:${m[1]}/${m[2]}`, url: `/preview/${m[1]}/${m[2]}?draft=1`, permission: "content.editLive" };
  m = NEWS.exec(path);
  if (m) {
    const id = m[1] ?? "new";
    return { key: `news:${id}`, url: `/preview/news/${id}?draft=1`, permission: "content.write" };
  }
  return null;
}

export const draftRowKey = (userId: number, key: string) => `preview:${userId}:${key}`;

export type StoredDraft = { payload: unknown; savedAt: number };

export function isFreshDraft(value: unknown, now = Date.now()): value is StoredDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<StoredDraft>;
  return typeof draft.savedAt === "number" && now - draft.savedAt >= 0 && now - draft.savedAt < DRAFT_MAX_AGE_MS && "payload" in draft;
}

export async function saveDraft(userId: number, key: string, payload: unknown): Promise<void> {
  await query(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2::text::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [draftRowKey(userId, key), JSON.stringify({ payload, savedAt: Date.now() })]
  );
  // Housekeeping: drop forgotten drafts so the table does not grow.
  await query("DELETE FROM settings WHERE key LIKE 'preview:%' AND updated_at < now() - interval '1 day'").catch(() => undefined);
}

/** The signed-in user's fresh draft for a page, or null (also when the database is unavailable). */
export async function loadDraft(key: string): Promise<unknown | null> {
  const session = await getSession();
  if (!session) return null;
  try {
    const row = await queryOne<{ value: unknown }>("SELECT value FROM settings WHERE key = $1", [draftRowKey(session.id, key)]);
    return isFreshDraft(row?.value) ? row.value.payload : null;
  } catch {
    return null;
  }
}

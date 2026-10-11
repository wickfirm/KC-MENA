import { query } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";

/**
 * Audit trail. Every admin mutation writes one row to activity_log.
 * logActivity is best-effort and NEVER throws — a logging failure must not
 * block a content save or sign-in. Read-only view: /admin/activity (admin only).
 */
export const activityActionLabels = {
  "auth.login": "Sign-ins",
  "auth.login_failed": "Failed sign-ins",
  "auth.logout": "Sign-outs",
  "content.save": "Content saves",
  "content.delete": "Content deletions",
  "content.restore": "Version restores",
  "settings.save": "Settings saves",
  "user.create": "Users created",
  "user.update": "User changes",
  "user.delete": "User deletions",
  "user.password": "Password changes",
  "media.upload": "Media uploads",
  "media.delete": "Media deletions",
  "rss.ingest": "RSS fetches",
  "rss.approve": "RSS approvals",
  "rss.reject": "RSS rejections",
  "submission.retry": "Salesforce retries",
} as const;

export type ActivityAction = keyof typeof activityActionLabels;

export type ActivityInput = {
  action: ActivityAction;
  summary: string;
  /** The acting user; omit for anonymous events such as a failed sign-in. */
  actor?: Pick<SessionUser, "id" | "email" | "name"> | null;
  entityType?: string;
  entityId?: string | number;
  metadata?: Record<string, unknown>;
};

export async function logActivity(input: ActivityInput): Promise<void> {
  try {
    await query(
      `INSERT INTO activity_log (action, summary, actor_id, actor_email, actor_name, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
      [
        input.action,
        input.summary.slice(0, 500),
        input.actor?.id ?? null,
        input.actor?.email ?? null,
        input.actor?.name || null,
        input.entityType ?? null,
        input.entityId == null ? null : String(input.entityId),
        input.metadata ? JSON.stringify(input.metadata) : null,
      ]
    );
  } catch (error) {
    console.error("[activity] failed to write log entry:", error);
  }
}

/** Best human label for a DB row returned by a save (title/name/question/slug). */
export function rowLabel(row: unknown): string {
  const r = (row ?? {}) as Record<string, unknown>;
  for (const key of ["title", "name", "question", "slug"]) {
    if (typeof r[key] === "string" && r[key]) return r[key] as string;
  }
  return r.id != null ? `#${r.id}` : "item";
}

export function rowId(row: unknown): string | number | undefined {
  const id = (row as { id?: unknown } | null)?.id;
  return typeof id === "string" || typeof id === "number" ? id : undefined;
}

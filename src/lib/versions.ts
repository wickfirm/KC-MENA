import { query, queryOne } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";

/**
 * Rolling content versions. Every successful content save stores a snapshot of the
 * record's editable columns; at most MAX_CONTENT_VERSIONS are kept per record (the
 * oldest is evicted first). Restoring writes the snapshot back and records a new
 * version, so a restore is itself undoable.
 *
 * Recording is best-effort: a failure here must never block the save itself.
 * Slugs are deliberately NOT versioned — they are link identity and must not change on restore.
 */
export const MAX_CONTENT_VERSIONS = 10;

type EntityConfig = {
  table: string;
  /** Column that identifies the record in this entity (pages: slug, settings: key, rest: id). */
  key: "id" | "slug" | "key";
  /** Editable columns captured in a snapshot and written back on restore. */
  cols: readonly string[];
  /** Subset of cols stored as JSONB. */
  json: readonly string[];
  /** Human noun for labels. */
  noun: string;
  /** Restoring needs an administrator (site-wide settings). */
  adminOnly?: boolean;
};

export const versionEntities = {
  page: { table: "pages", key: "slug", cols: ["title", "status", "content", "seo"], json: ["content", "seo"], noun: "page" },
  news: { table: "news_posts", key: "id", cols: ["title", "excerpt", "body", "cover_image", "category", "status", "published_at"], json: [], noun: "news post" },
  faq: { table: "faqs", key: "id", cols: ["question", "answer", "category", "sort_order", "is_published"], json: [], noun: "FAQ" },
  project: { table: "projects", key: "id", cols: ["name", "sector", "status", "location", "summary", "description", "images", "metadata", "sort_order"], json: ["images", "metadata"], noun: "project" },
  job: { table: "job_openings", key: "id", cols: ["title", "department", "location", "employment", "description", "status", "closing_date"], json: [], noun: "job" },
  settings: { table: "settings", key: "key", cols: ["value"], json: ["value"], noun: "site settings", adminOnly: true },
} as const satisfies Record<string, EntityConfig>;

export type VersionEntity = keyof typeof versionEntities;

export function isVersionEntity(value: unknown): value is VersionEntity {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(versionEntities, value);
}

/** Roles allowed to view/restore versions of an entity (site-wide settings are admin-only). */
export function versionRoles(entity: VersionEntity): ("admin" | "editor")[] {
  return (versionEntities[entity] as EntityConfig).adminOnly ? ["admin"] : ["admin", "editor"];
}

export type VersionSnapshot = Record<string, unknown>;

/** Pick the editable columns out of a DB row. Dates are normalised to ISO strings. */
export function snapshotFromRow(entity: VersionEntity, row: Record<string, unknown>): VersionSnapshot {
  const out: VersionSnapshot = {};
  for (const col of versionEntities[entity].cols) {
    const value = row[col];
    out[col] = value instanceof Date ? value.toISOString() : value ?? null;
  }
  return out;
}

/** The record id used to group versions (pages: slug, settings: key, others: id). */
export function entityIdFromRow(entity: VersionEntity, row: Record<string, unknown>): string | null {
  const value = row[versionEntities[entity].key];
  return typeof value === "string" || typeof value === "number" ? String(value) : null;
}

/** SQL + params that write a snapshot back onto its record. Unknown columns are ignored. */
export function buildRestoreQuery(
  entity: VersionEntity,
  entityId: string,
  snapshot: VersionSnapshot
): { text: string; params: unknown[] } {
  const config: EntityConfig = versionEntities[entity];
  const params: unknown[] = [config.key === "id" ? Number(entityId) : entityId];
  const sets: string[] = [];
  for (const col of config.cols) {
    if (!(col in snapshot)) continue;
    const value = snapshot[col];
    params.push(config.json.includes(col) ? JSON.stringify(value ?? null) : value ?? null);
    sets.push(`${col} = $${params.length}${config.json.includes(col) ? "::jsonb" : ""}`);
  }
  if (sets.length === 0) throw new Error("Snapshot has no restorable fields");
  return {
    text: `UPDATE ${config.table} SET ${sets.join(", ")}, updated_at = now() WHERE ${config.key} = $1 RETURNING *`,
    params,
  };
}

export type VersionRow = {
  id: number;
  entity_type: string;
  entity_id: string;
  version_number: number;
  label: string;
  author_email: string | null;
  author_name: string | null;
  created_at: string;
};

/** Store a version of a just-saved row. Never throws. */
export async function recordVersion(
  entity: VersionEntity,
  row: unknown,
  actor: Pick<SessionUser, "id" | "email" | "name"> | null,
  label?: string
): Promise<void> {
  try {
    const record = (row ?? {}) as Record<string, unknown>;
    const entityId = entityIdFromRow(entity, record);
    if (!entityId) return;
    const snapshot = JSON.stringify(snapshotFromRow(entity, record));
    const text = label ?? `Saved ${versionEntities[entity].noun}`;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await query(
          `INSERT INTO content_versions (entity_type, entity_id, version_number, label, snapshot, author_id, author_email, author_name)
           SELECT $1, $2, COALESCE(MAX(version_number), 0) + 1, $3, $4::jsonb, $5, $6, $7
           FROM content_versions WHERE entity_type = $1 AND entity_id = $2`,
          [entity, entityId, text.slice(0, 160), snapshot, actor?.id ?? null, actor?.email ?? null, actor?.name || null]
        );
        break;
      } catch (error) {
        // Concurrent saves can race on the version number; retry once.
        const race = String((error as { code?: string }).code) === "23505";
        if (!race || attempt === 1) throw error;
      }
    }

    await query(
      `DELETE FROM content_versions WHERE entity_type = $1 AND entity_id = $2 AND version_number <= (
         SELECT version_number FROM content_versions WHERE entity_type = $1 AND entity_id = $2
         ORDER BY version_number DESC OFFSET $3 LIMIT 1)`,
      [entity, entityId, MAX_CONTENT_VERSIONS]
    );
  } catch (error) {
    console.error("[versions] failed to record version:", error);
  }
}

export async function listVersions(entity: VersionEntity, entityId: string): Promise<VersionRow[]> {
  return query<VersionRow>(
    `SELECT id, entity_type, entity_id, version_number, label, author_email, author_name, created_at
     FROM content_versions WHERE entity_type = $1 AND entity_id = $2 ORDER BY version_number DESC`,
    [entity, entityId]
  );
}

export async function getVersion(id: number) {
  return queryOne<VersionRow & { snapshot: VersionSnapshot }>(
    `SELECT id, entity_type, entity_id, version_number, label, author_email, author_name, created_at, snapshot
     FROM content_versions WHERE id = $1`,
    [id]
  );
}

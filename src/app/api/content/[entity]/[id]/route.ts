import { NextRequest, NextResponse } from "next/server";
import { can } from "@/lib/permissions";
import { getSession, denyUnlessCan } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { logActivity, rowId, rowLabel } from "@/lib/activity";
import { recordVersion, type VersionEntity } from "@/lib/versions";

export const dynamic = "force-dynamic";

type Config = {
  table: string;
  version: VersionEntity;
  noun: string;
  /** SET clause for publish / unpublish. */
  publish: string;
  unpublish: string;
  /** Columns copied by duplicate; slug/title handling is below. */
  copyCols: string[];
  slug: boolean;
  titleCol: string;
};

const ENTITIES: Record<string, Config> = {
  news: {
    table: "news_posts", version: "news", noun: "news post", slug: true, titleCol: "title",
    publish: "status = 'published', published_at = COALESCE(published_at, now())",
    unpublish: "status = 'draft', published_at = NULL",
    copyCols: ["title", "excerpt", "body", "cover_image", "category"],
  },
  job: {
    table: "job_openings", version: "job", noun: "job", slug: true, titleCol: "title",
    publish: "status = 'open'", unpublish: "status = 'draft'",
    copyCols: ["title", "department", "location", "employment", "description", "closing_date"],
  },
  project: {
    table: "projects", version: "project", noun: "project", slug: true, titleCol: "name",
    publish: "status = 'published'", unpublish: "status = 'draft'",
    copyCols: ["name", "sector", "location", "summary", "description", "images", "metadata", "sort_order"],
  },
  faq: {
    table: "faqs", version: "faq", noun: "FAQ", slug: false, titleCol: "question",
    publish: "is_published = true", unpublish: "is_published = false",
    copyCols: ["question", "answer", "category", "sort_order"],
  },
};

/** The status column a duplicate must reset (so a copy never goes live by itself). */
const STATUS_COL: Record<string, string> = { news: "status", job: "status", project: "status", faq: "is_published" };

async function freeSlug(table: string, base: string): Promise<string> {
  for (let n = 1; n <= 50; n += 1) {
    const candidate = n === 1 ? `${base}-copy` : `${base}-copy-${n}`;
    const taken = await queryOne(`SELECT 1 FROM ${table} WHERE slug = $1`, [candidate]);
    if (!taken) return candidate;
  }
  return `${base}-copy-${Date.now()}`;
}

/**
 * POST /api/content/:entity/:id — one-click row actions from the list screens.
 * Body: { action: "publish" | "unpublish" | "duplicate" }. Copies are always created unpublished.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ entity: string; id: string }> }) {
  const session = await getSession();
  const denied = denyUnlessCan(session, "content.write");
  if (denied || !session) return denied!;

  const { entity, id } = await ctx.params;
  const config = Object.prototype.hasOwnProperty.call(ENTITIES, entity) ? ENTITIES[entity] : null;
  const rowKey = Number(id);
  if (!config || !Number.isInteger(rowKey)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    if (body.action === "publish" || body.action === "unpublish") {
      if (!can(session.role, "content.publish")) return NextResponse.json({ error: "Only an Editor can publish or unpublish." }, { status: 403 });
      const set = body.action === "publish" ? config.publish : config.unpublish;
      const rows = await query(`UPDATE ${config.table} SET ${set}, updated_at = now() WHERE id = $1 RETURNING *`, [rowKey]);
      if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await logActivity({
        action: "content.save",
        summary: `${body.action === "publish" ? "Published" : "Unpublished"} ${config.noun} “${rowLabel(rows[0])}”`,
        actor: session, entityType: entity, entityId: rowId(rows[0]),
      });
      await recordVersion(config.version, rows[0], session, body.action === "publish" ? "Published" : "Unpublished");
      return NextResponse.json({ ok: true });
    }

    if (body.action === "duplicate") {
      // Contributors may copy the content they write (news, projects); FAQs and jobs are live-page content.
      if ((entity === "faq" || entity === "job") && !can(session.role, "content.editLive")) {
        return NextResponse.json({ error: "You do not have permission to do that" }, { status: 403 });
      }
      const source = await queryOne<Record<string, unknown>>(`SELECT * FROM ${config.table} WHERE id = $1`, [rowKey]);
      if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const cols = [...config.copyCols];
      const values: unknown[] = config.copyCols.map((c) => {
        const v = source[c];
        if (c === config.titleCol && typeof v === "string") return `${v} (copy)`;
        return v !== null && typeof v === "object" && !(v instanceof Date) ? JSON.stringify(v) : v ?? null;
      });
      const placeholders = config.copyCols.map((c, i) => (["images", "metadata"].includes(c) ? `$${i + 1}::text::jsonb` : `$${i + 1}`));
      // A copy is always created unpublished.
      cols.push(STATUS_COL[entity]);
      values.push(entity === "faq" ? false : "draft");
      placeholders.push(`$${values.length}`);
      if (config.slug) {
        cols.push("slug");
        values.push(await freeSlug(config.table, String(source.slug)));
        placeholders.push(`$${values.length}`);
      }
      const rows = await query(
        `INSERT INTO ${config.table} (${cols.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`,
        values
      );
      await logActivity({
        action: "content.save",
        summary: `Duplicated ${config.noun} “${rowLabel(source)}”`,
        actor: session, entityType: entity, entityId: rowId(rows[0]),
      });
      await recordVersion(config.version, rows[0], session, "Duplicated");
      return NextResponse.json({ ok: true, id: rowId(rows[0]) }, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error(`POST /api/content/${entity}/${id} error:`, error);
    return NextResponse.json({ error: "Could not complete that action" }, { status: 500 });
  }
}

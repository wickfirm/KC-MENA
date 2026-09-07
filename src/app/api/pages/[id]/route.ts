import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import type { PagePayload } from "../route";

export const dynamic = "force-dynamic";

/**
 * PUT /api/pages/:id — update a page (admin only).
 * The previous version is snapshotted into page_revisions before the update.
 */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const pageId = Number(id);
  if (!Number.isInteger(pageId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let p: PagePayload;
  try {
    p = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const current = await queryOne("SELECT id, slug, title, content, seo FROM pages WHERE id = $1", [pageId]);
    if (!current) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    if (p.slug !== undefined && p.slug !== current.slug) {
      return NextResponse.json({ error: "Slug cannot be changed (links would break)" }, { status: 400 });
    }

    // Snapshot the pre-update version
    await query(
      "INSERT INTO page_revisions (page_id, content, seo, created_by) VALUES ($1, $2::jsonb, $3::jsonb, $4)",
      [pageId, JSON.stringify(current.content), JSON.stringify(current.seo ?? {}), session.id]
    );

    const rows = await query(
      `UPDATE pages SET
         title = COALESCE($2, title),
         status = COALESCE($3, status),
         content = COALESCE($4::jsonb, content),
         seo = COALESCE($5::jsonb, seo),
         updated_by = $6,
         updated_at = now()
       WHERE id = $1 RETURNING *`,
      [
        pageId,
        p.title?.trim() ?? null,
        p.status === "published" ? "published" : p.status === "draft" ? "draft" : null,
        p.content ? JSON.stringify({ meta: p.content.meta ?? "", body: p.content.body ?? "" }) : null,
        p.seo ? JSON.stringify({ title: p.seo.title ?? "", description: p.seo.description ?? "" }) : null,
        session.id,
      ]
    );
    return NextResponse.json({ page: rows[0] });
  } catch (err) {
    console.error("PUT /api/pages/:id error:", err);
    return NextResponse.json({ error: "Could not update page" }, { status: 500 });
  }
}

/** GET /api/pages/:id — page + revision history (admin only) */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const pageId = Number(id);
  if (!Number.isInteger(pageId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const page = await queryOne("SELECT * FROM pages WHERE id = $1", [pageId]);
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    const revisions = await query(
      "SELECT id, created_at, created_by FROM page_revisions WHERE page_id = $1 ORDER BY created_at DESC LIMIT 20",
      [pageId]
    );
    return NextResponse.json({ page, revisions });
  } catch (err) {
    console.error("GET /api/pages/:id error:", err);
    return NextResponse.json({ error: "Could not load page" }, { status: 500 });
  }
}

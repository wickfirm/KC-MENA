import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnlessCan } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { recordVersion } from "@/lib/versions";
import { query, queryOne } from "@/lib/db";
import { LEGAL_PAGE_TITLES, isLegalContent, isLegalSlug } from "@/lib/legal-content";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!isLegalSlug(slug)) return NextResponse.json({ error: "Unknown legal page" }, { status: 404 });
  const session = await getSession();
  const denied = denyUnlessCan(session, "content.editLive");
  if (denied || !session) return denied!;
  let body: { status?: string; seo?: { title?: string; description?: string }; content?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
  if (typeof body.content === "string") {
    try { body.content = JSON.parse(body.content); } catch { /* validation rejects */ }
  }
  if (!isLegalContent(body.content)) return NextResponse.json({ error: "Legal content is invalid" }, { status: 400 });
  const title = body.content.title.trim() || LEGAL_PAGE_TITLES[slug];
  const content = { ...body.content, title };
  try {
    const current = await queryOne<{ id: number; content: unknown; seo: unknown }>("SELECT id, content, seo FROM pages WHERE slug = $1", [slug]);
    if (current) await query("INSERT INTO page_revisions (page_id, content, seo, created_by) VALUES ($1, $2::text::jsonb, $3::text::jsonb, $4)", [current.id, JSON.stringify(current.content), JSON.stringify(current.seo ?? {}), session.id]);
    const rows = await query(
      `INSERT INTO pages (slug, title, status, content, seo, updated_by)
       VALUES ($1, $2, $3, $4::text::jsonb, $5::text::jsonb, $6)
       ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, content = EXCLUDED.content, seo = EXCLUDED.seo, updated_by = EXCLUDED.updated_by, updated_at = now()
       RETURNING id, slug, title, status, content, seo`,
      [slug, title, body.status === "draft" ? "draft" : "published", JSON.stringify(content), JSON.stringify(body.seo ?? {}), session.id]
    );
    await logActivity({ action: "content.save", summary: `Saved ${title}`, actor: session, entityType: "site-page", entityId: slug });
    await recordVersion("page", rows[0], session);
    return NextResponse.json({ page: rows[0] });
  } catch (error) {
    console.error(`PUT /api/site-pages/legal/${slug} error:`, error);
    return NextResponse.json({ error: "Could not save the legal page" }, { status: 500 });
  }
}

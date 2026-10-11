import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnlessCan } from "@/lib/auth";
import { logActivity, rowLabel, rowId } from "@/lib/activity";
import { recordVersion } from "@/lib/versions";
import { query, queryOne } from "@/lib/db";
import {
  isBusinessDetailContent,
  isBusinessDetailSlug,
  type BusinessDetailContent,
} from "@/lib/business-detail-content";

export const dynamic = "force-dynamic";

type Payload = {
  status?: "draft" | "published";
  seo?: { title?: string; description?: string };
  content?: BusinessDetailContent;
};

export async function PUT(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  const denied = denyUnlessCan(session, "content.editLive");
  if (denied || !session) return denied!;

  const { slug } = await context.params;
  if (!isBusinessDetailSlug(slug)) return NextResponse.json({ error: "Unknown business page" }, { status: 404 });

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  if (typeof (payload.content as unknown) === "string") {
    try { payload.content = JSON.parse(payload.content as unknown as string); } catch { /* validation will reject */ }
  }
  }
  if (!isBusinessDetailContent(payload.content)) {
    return NextResponse.json({ error: "Business page content is invalid" }, { status: 400 });
  }

  try {
    const current = await queryOne<{ id: number; content: unknown; seo: unknown }>(
      "SELECT id, content, seo FROM pages WHERE slug = $1",
      [slug]
    );
    if (current) {
      await query(
        "INSERT INTO page_revisions (page_id, content, seo, created_by) VALUES ($1, $2::text::jsonb, $3::text::jsonb, $4)",
        [current.id, JSON.stringify(current.content), JSON.stringify(current.seo ?? {}), session.id]
      );
    }
    const rows = await query(
      `INSERT INTO pages (slug, title, status, content, seo, updated_by)
       VALUES ($1, $2, $3, $4::text::jsonb, $5::text::jsonb, $6)
       ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status,
         content = EXCLUDED.content, seo = EXCLUDED.seo, updated_by = EXCLUDED.updated_by, updated_at = now()
       RETURNING id, title, status, content, seo, updated_at`,
      [slug, payload.content.hero.title, payload.status === "draft" ? "draft" : "published", JSON.stringify(payload.content), JSON.stringify(payload.seo ?? {}), session.id]
    );
    await logActivity({ action: "content.save", summary: `Saved business page “${rowLabel(rows[0])}”`, actor: session, entityType: "site-page", entityId: rowId(rows[0]) });
    await recordVersion("page", { ...rows[0], slug }, session);
    return NextResponse.json({ page: rows[0] });
  } catch (error) {
    console.error(`PUT /api/site-pages/business/${slug} error:`, error);
    return NextResponse.json({ error: "Could not save the business page" }, { status: 500 });
  }
}

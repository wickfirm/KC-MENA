import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { isAboutContent, type AboutContent } from "@/lib/about-content";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  const session = await getSession(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { status?: string; seo?: Record<string, string>; content?: AboutContent };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
  if (!isAboutContent(body.content)) return NextResponse.json({ error: "About content is invalid" }, { status: 400 });
  try {
    const current = await queryOne<{ id: number; content: unknown; seo: unknown }>("SELECT id, content, seo FROM pages WHERE slug = 'about-us'");
    if (current) await query("INSERT INTO page_revisions (page_id, content, seo, created_by) VALUES ($1, $2::jsonb, $3::jsonb, $4)", [current.id, JSON.stringify(current.content), JSON.stringify(current.seo ?? {}), session.id]);
    const rows = await query(`INSERT INTO pages (slug,title,status,content,seo,updated_by) VALUES ('about-us','About Us',$1,$2::jsonb,$3::jsonb,$4) ON CONFLICT (slug) DO UPDATE SET status=EXCLUDED.status,content=EXCLUDED.content,seo=EXCLUDED.seo,updated_by=EXCLUDED.updated_by,updated_at=now() RETURNING *`, [body.status === "draft" ? "draft" : "published", JSON.stringify(body.content), JSON.stringify(body.seo ?? {}), session.id]);
    return NextResponse.json({ page: rows[0] });
  } catch (error) { console.error("PUT /api/site-pages/about error:", error); return NextResponse.json({ error: "Could not save About Us" }, { status: 500 }); }
}

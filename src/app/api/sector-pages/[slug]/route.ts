import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";
const SECTORS = ["real-estate", "real-estate-development", "f-and-b", "local-business", "global-businesses"];

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  if (!await getSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const slug = (await ctx.params).slug;
  if (!SECTORS.includes(slug)) return NextResponse.json({ error: "Unknown sector" }, { status: 404 });
  try { return NextResponse.json({ page: await queryOne("SELECT * FROM pages WHERE slug = $1", [slug]) }); }
  catch (err) { console.error("GET sector page error:", err); return NextResponse.json({ error: "Could not load page" }, { status: 500 }); }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const slug = (await ctx.params).slug;
  if (!SECTORS.includes(slug)) return NextResponse.json({ error: "Unknown sector" }, { status: 404 });
  let body: { title?: string; status?: string; content?: Record<string, unknown>; seo?: Record<string, unknown> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
  if (!body.title?.trim()) return NextResponse.json({ error: "Page title is required" }, { status: 400 });
  try {
    const rows = await query(
      `INSERT INTO pages (slug,title,status,content,seo,updated_by) VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6)
       ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,content=EXCLUDED.content,seo=EXCLUDED.seo,updated_by=EXCLUDED.updated_by,updated_at=now()
       RETURNING *`,
      [slug, body.title.trim(), body.status === "draft" ? "draft" : "published", JSON.stringify(body.content ?? {}), JSON.stringify(body.seo ?? {}), session.id]
    );
    return NextResponse.json({ page: rows[0] });
  } catch (err) { console.error("PUT sector page error:", err); return NextResponse.json({ error: "Could not save page" }, { status: 500 }); }
}

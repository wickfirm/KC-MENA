import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { validateModuleDocument, type ModuleDocument } from "@/lib/content-modules";

export const dynamic = "force-dynamic";

type Payload = { status?: "draft" | "published"; seo?: { title?: string; description?: string }; content?: ModuleDocument };

export async function GET() {
  if (!await getSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const page = await queryOne("SELECT id, title, status, content, seo, updated_at FROM pages WHERE slug = 'home'");
    return NextResponse.json({ page });
  } catch (error) {
    console.error("GET /api/site-pages/home error:", error);
    return NextResponse.json({ error: "Could not load the Home page" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let payload: Payload;
  try { payload = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
  const issues = validateModuleDocument(payload.content);
  if (payload.content?.template !== "home" || issues.length > 0) {
    return NextResponse.json({ error: "Home content is invalid", issues }, { status: 400 });
  }
  try {
    const current = await queryOne<{ id: number; content: unknown; seo: unknown }>("SELECT id, content, seo FROM pages WHERE slug = 'home'");
    if (current) await query("INSERT INTO page_revisions (page_id, content, seo, created_by) VALUES ($1, $2::jsonb, $3::jsonb, $4)", [current.id, JSON.stringify(current.content), JSON.stringify(current.seo ?? {}), session.id]);
    const rows = await query(
      `INSERT INTO pages (slug, title, status, content, seo, updated_by)
       VALUES ('home', 'Home', $1, $2::jsonb, $3::jsonb, $4)
       ON CONFLICT (slug) DO UPDATE SET status = EXCLUDED.status, content = EXCLUDED.content, seo = EXCLUDED.seo, updated_by = EXCLUDED.updated_by, updated_at = now()
       RETURNING id, title, status, content, seo, updated_at`,
      [payload.status === "draft" ? "draft" : "published", JSON.stringify(payload.content), JSON.stringify(payload.seo ?? {}), session.id]
    );
    return NextResponse.json({ page: rows[0] });
  } catch (error) {
    console.error("PUT /api/site-pages/home error:", error);
    return NextResponse.json({ error: "Could not save the Home page" }, { status: 500 });
  }
}

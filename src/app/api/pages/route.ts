import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

export type PagePayload = {
  slug?: string;
  title?: string;
  status?: string;
  content?: { meta?: string; body?: string };
  seo?: { title?: string; description?: string };
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** GET /api/pages — list all pages (admin only) */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await query("SELECT id, slug, title, status, updated_at FROM pages ORDER BY slug ASC");
  return NextResponse.json({ pages: rows });
}

/** POST /api/pages — create a page (admin only) */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let p: PagePayload;
  try {
    p = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const slug = (p.slug ?? "").trim();
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Slug is required (lowercase letters, numbers, hyphens)" }, { status: 400 });
  }
  if (!p.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  try {
    const existing = await queryOne("SELECT id FROM pages WHERE slug = $1", [slug]);
    if (existing) return NextResponse.json({ error: `A page with slug "${slug}" already exists` }, { status: 409 });

    const rows = await query(
      `INSERT INTO pages (slug, title, status, content, seo, updated_by)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6) RETURNING *`,
      [
        slug,
        p.title.trim(),
        p.status === "published" ? "published" : "draft",
        JSON.stringify({ meta: p.content?.meta ?? "", body: p.content?.body ?? "" }),
        JSON.stringify({ title: p.seo?.title ?? "", description: p.seo?.description ?? "" }),
        session.id,
      ]
    );
    return NextResponse.json({ page: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/pages error:", err);
    return NextResponse.json({ error: "Could not save page" }, { status: 500 });
  }
}

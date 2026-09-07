import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export type NewsPayload = {
  title?: string;
  slug?: string;
  category?: string | null;
  excerpt?: string;
  body?: string;
  cover_image?: string | null;
  status?: string;
  published_at?: string | null;
  source?: "manual" | "rss";
  rss_item_id?: number | null;
};

/** GET /api/news — list posts (admin only) */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await query("SELECT * FROM news_posts ORDER BY updated_at DESC LIMIT 200");
  return NextResponse.json({ posts: rows });
}

/** POST /api/news — create a post (admin only) */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let p: NewsPayload;
  try {
    p = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!p.title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const slug = slugify(p.slug?.trim() || p.title);
  const status = ["draft", "in_review", "published"].includes(p.status ?? "") ? p.status! : "draft";

  try {
    const rows = await query(
      `INSERT INTO news_posts (slug, title, excerpt, body, cover_image, category, status, source, rss_item_id, published_at, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, body = EXCLUDED.body,
         cover_image = EXCLUDED.cover_image, category = EXCLUDED.category,
         status = EXCLUDED.status, published_at = EXCLUDED.published_at,
         updated_at = now()
       RETURNING *`,
      [
        slug,
        p.title.trim(),
        p.excerpt ?? "",
        p.body ?? "",
        p.cover_image || null,
        p.category || null,
        status,
        p.source ?? "manual",
        p.rss_item_id ?? null,
        status === "published" ? (p.published_at ?? new Date().toISOString()) : null,
        session.id,
      ]
    );
    return NextResponse.json({ post: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/news error:", err);
    return NextResponse.json({ error: "Could not save post — is the database set up?" }, { status: 500 });
  }
}

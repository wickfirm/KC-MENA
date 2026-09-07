import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import type { NewsPayload } from "../route";

export const dynamic = "force-dynamic";

/** PUT /api/news/:id — update a post (admin only) */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let p: NewsPayload;
  try {
    p = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const status = ["draft", "in_review", "published"].includes(p.status ?? "") ? p.status! : "draft";

  try {
    const rows = await query(
      `UPDATE news_posts SET
         title = COALESCE($2, title),
         slug = COALESCE($3, slug),
         excerpt = COALESCE($4, excerpt),
         body = COALESCE($5, body),
         cover_image = $6,
         category = $7,
         status = $8,
         published_at = CASE
           WHEN $8 = 'published' THEN COALESCE(published_at, $9)
           ELSE NULL
         END,
         updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [
        postId,
        p.title?.trim() ?? null,
        p.slug?.trim() || null,
        p.excerpt ?? null,
        p.body ?? null,
        p.cover_image || null,
        p.category || null,
        status,
        p.published_at ?? new Date().toISOString(),
      ]
    );
    if (!rows[0]) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ post: rows[0] });
  } catch (err) {
    console.error("PUT /api/news/:id error:", err);
    return NextResponse.json({ error: "Could not update post" }, { status: 500 });
  }
}

/** DELETE /api/news/:id — delete a post (admin only) */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const row = await queryOne("DELETE FROM news_posts WHERE id = $1 RETURNING id", [postId]);
    if (!row) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/news/:id error:", err);
    return NextResponse.json({ error: "Could not delete post" }, { status: 500 });
  }
}

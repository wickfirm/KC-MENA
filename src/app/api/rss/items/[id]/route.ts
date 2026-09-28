import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

type RssItemRow = {
  id: number;
  guid: string;
  title: string;
  link: string;
  summary: string | null;
  status: string;
  news_post_id: number | null;
};

/** PUT /api/rss/items/:id — { action: "approve" | "reject" }.
 *  Approve creates a DRAFT news post (source 'rss') linked back to the item;
  * an editor reviews and publishes it from the News screen. */
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId)) return NextResponse.json({ error: "Invalid item id" }, { status: 400 });

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json({ error: "Action must be approve or reject" }, { status: 400 });
  }

  try {
    const item = await queryOne<RssItemRow>(
      "SELECT id, guid, title, link, summary, status, news_post_id FROM rss_items WHERE id = $1",
      [itemId]
    );
    if (!item) return NextResponse.json({ error: "Feed item not found" }, { status: 404 });

    if (body.action === "reject") {
      if (item.status === "approved") return NextResponse.json({ error: "Approved items cannot be rejected" }, { status: 400 });
      await query("UPDATE rss_items SET status = 'rejected', reviewed_by = $2, reviewed_at = now() WHERE id = $1", [itemId, session.id]);
      return NextResponse.json({ ok: true, status: "rejected" });
    }

    // Approve — reuse the linked post if this item was approved before.
    let postId = item.news_post_id;
    if (!postId) {
      const base = slugify(item.title) || `rss-item-${item.id}`;
      const taken = await query<{ slug: string }>(
        "SELECT slug FROM news_posts WHERE slug = $1 OR slug LIKE $2",
        [base, `${base}-%`]
      );
      let slug = base;
      for (let n = taken.length + 1; taken.some((row) => row.slug === slug); n += 1) slug = `${base}-${n}`;
      const sourceParagraph = `Source: ${item.link}`;
      const bodyText = item.summary ? `${item.summary}\n\n${sourceParagraph}` : sourceParagraph;
      const inserted = await query<{ id: number }>(
        `INSERT INTO news_posts (slug, title, excerpt, body, category, status, source, rss_item_id, created_by)
         VALUES ($1, $2, $3, $4, $5, 'draft', 'rss', $6, $7) RETURNING id`,
        [slug, item.title, (item.summary ?? "").slice(0, 300), bodyText, "RSS", item.id, session.id]
      );
      postId = inserted[0]?.id ?? null;
      if (!postId) return NextResponse.json({ error: "Could not create the news post" }, { status: 500 });
    }

    await query(
      "UPDATE rss_items SET status = 'approved', reviewed_by = $2, reviewed_at = now(), news_post_id = $3 WHERE id = $1",
      [itemId, session.id, postId]
    );
    return NextResponse.json({ ok: true, status: "approved", newsPostId: postId });
  } catch (error) {
    console.error(`PUT /api/rss/items/${itemId} error:`, error);
    return NextResponse.json({ error: "Could not update the feed item" }, { status: 500 });
  }
}
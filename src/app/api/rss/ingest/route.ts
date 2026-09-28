import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { fetchFeed } from "@/lib/rss";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** POST /api/rss/ingest — pull every active feed and queue new items for review. */
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let sources: Array<{ id: number; name: string; url: string }>;
  try {
    sources = await query("SELECT id, name, url FROM rss_sources WHERE is_active = true ORDER BY id");
  } catch (error) {
    console.error("POST /api/rss/ingest error (loading sources):", error);
    return NextResponse.json({ error: "Could not load feed sources" }, { status: 500 });
  }
  if (!sources.length) return NextResponse.json({ error: "No active feed sources to fetch. Add one first." }, { status: 400 });

  const perSource = await Promise.all(
    sources.map(async (source) => {
      try {
        const items = await fetchFeed(source.url);
        let imported = 0;
        for (const item of items) {
          const rows = await query(
            `INSERT INTO rss_items (source_id, guid, title, link, summary, published_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (guid) DO NOTHING
             RETURNING id`,
            [source.id, item.guid, item.title, item.link, item.summary || null, item.publishedAt]
          );
          imported += rows.length;
        }
        return { source: source.name, ok: true as const, imported, total: items.length };
      } catch (error) {
        console.error(`POST /api/rss/ingest feed error (${source.url}):`, error);
        return { source: source.name, ok: false as const, error: error instanceof Error ? error.message : "Fetch failed" };
      }
    })
  );

  const imported = perSource.reduce((sum, result) => sum + (result.ok ? result.imported : 0), 0);
  return NextResponse.json({ ok: true, imported, sources: perSource });
}
import { query } from "@/lib/db";
import { fetchFeed } from "@/lib/rss";

export type FeedResult =
  | { source: string; ok: true; imported: number; total: number }
  | { source: string; ok: false; error: string };

/**
 * Pull every active RSS source and queue new items (deduplicated by guid) as `pending`
 * for editorial review. Shared by the admin "Fetch feeds now" button and the scheduled cron.
 * Returns null when there are no active sources; throws only if the sources cannot be loaded.
 */
export async function ingestActiveFeeds(): Promise<{ imported: number; sources: FeedResult[] } | null> {
  const sources = await query<{ id: number; name: string; url: string }>(
    "SELECT id, name, url FROM rss_sources WHERE is_active = true ORDER BY id"
  );
  if (!sources.length) return null;

  const results = await Promise.all(
    sources.map(async (source): Promise<FeedResult> => {
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
        return { source: source.name, ok: true, imported, total: items.length };
      } catch (error) {
        console.error(`RSS ingest feed error (${source.url}):`, error);
        return { source: source.name, ok: false, error: error instanceof Error ? error.message : "Fetch failed" };
      }
    })
  );

  const imported = results.reduce((sum, r) => sum + (r.ok ? r.imported : 0), 0);
  return { imported, sources: results };
}

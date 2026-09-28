export type FeedItem = {
  guid: string;
  title: string;
  link: string;
  summary: string;
  publishedAt: Date | null;
};

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

function firstLink(block: string): string {
  // Atom uses <link rel="alternate" href="...">; RSS uses <link>text</link>.
  const attr = block.match(/<link\b[^>]*rel=["']?alternate["']?[^>]*href=["']([^"']+)["']/i) ?? block.match(/<link\b[^>]*href=["']([^"']+)["']/i);
  if (attr) return decodeEntities(attr[1]);
  const element = block.match(/<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i);
  return element ? decodeEntities(element[1]) : "";
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Minimal dependency-free RSS 2.0 / Atom parser. Extracts the fields the
 * review queue needs (guid, title, link, summary, date); good enough for
 * standard feeds — malformed entries are skipped rather than failing the run.
 */
export function parseFeed(xml: string): FeedItem[] {
  const blocks = [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map((match) => match[2]);
  const items: FeedItem[] = [];
  for (const block of blocks) {
    const title = tag(block, "title");
    const link = firstLink(block);
    if (!title || !link) continue;
    const guid = tag(block, "guid") || tag(block, "id") || link;
    const summary = tag(block, "description") || tag(block, "summary") || tag(block, "content:encoded") || tag(block, "content");
    const publishedAt = parseDate(tag(block, "pubDate") || tag(block, "published") || tag(block, "updated") || tag(block, "date"));
    // Strip HTML tags from the summary so the CMS stores clean text.
    const cleanSummary = summary.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    items.push({ guid, title, link, summary: cleanSummary.slice(0, 1000), publishedAt });
  }
  return items;
}

/** Fetch and parse a feed URL with a hard timeout. */
export async function fetchFeed(url: string): Promise<FeedItem[]> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { "User-Agent": "KasumigasekiMENA-CMS/1.0 (+https://kasumigaseki.ae)" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Feed responded ${response.status}`);
  return parseFeed(await response.text());
}
import { queryOne } from "@/lib/db";

export type PageRow = {
  id: number;
  slug: string;
  title: string;
  status: string;
  content: {
    meta?: string; // html — "last updated" aside for legal pages
    body?: string; // html — main content
    [key: string]: unknown;
  } | null;
  seo: { title?: string; description?: string; og_image?: string } | null;
};

/** Fetch a single page by slug. Returns null when missing or DB unavailable. */
export async function getPageBySlug(slug: string, publishedOnly = true): Promise<PageRow | null> {
  try {
    const sql = publishedOnly
      ? "SELECT id, slug, title, status, content, seo FROM pages WHERE slug = $1 AND status = 'published'"
      : "SELECT id, slug, title, status, content, seo FROM pages WHERE slug = $1";
    const parsed = await queryOne<PageRow>(sql, [slug]);
    // Some early rows stored content double-encoded (a JSON string inside the
    // jsonb column). Unwrap so renderers and editors always see an object.
    if (parsed && typeof parsed.content === "string") {
      try { parsed.content = JSON.parse(parsed.content); } catch { parsed.content = null; }
    }
    return parsed;
  } catch {
    return null;
  }
}

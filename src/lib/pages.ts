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
    return await queryOne<PageRow>(sql, [slug]);
  } catch {
    return null;
  }
}

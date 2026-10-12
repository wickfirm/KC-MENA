import type { MetadataRoute } from "next";
import { query } from "@/lib/db";
import { PAGE_SEO, type PageKey } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const PRIORITY: Partial<Record<PageKey, number>> = { home: 1, "local-business": 0.9, "real-estate-development": 0.9, "real-estate": 0.9, "f-and-b": 0.9, news: 0.8 };
const LEGAL: PageKey[] = ["privacy-policy", "terms-and-conditions", "cookie-policy", "legal-notice"];

/**
 * Every public page plus every published news article. A database problem degrades to the fixed pages
 * instead of a 500: search engines must always receive a valid document.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let updated = new Map<string, Date>();
  let articles: { slug: string; published_at: Date | null; updated_at: Date | null }[] = [];
  try {
    const [pages, posts] = await Promise.all([
      query<{ slug: string; updated_at: Date }>(`SELECT slug, updated_at FROM pages WHERE status = 'published'`),
      query<{ slug: string; published_at: Date | null; updated_at: Date | null }>(
        `SELECT slug, published_at, updated_at FROM news_posts WHERE status = 'published' ORDER BY published_at DESC NULLS LAST`
      ),
    ]);
    updated = new Map(pages.map((page) => [page.slug, new Date(page.updated_at)]));
    articles = posts;
  } catch {
    // fixed pages only
  }

  const fixed: MetadataRoute.Sitemap = (Object.keys(PAGE_SEO) as PageKey[]).map((key) => {
    const legal = LEGAL.includes(key);
    return {
      url: absoluteUrl(PAGE_SEO[key].path),
      lastModified: updated.get(key),
      changeFrequency: key === "news" ? "daily" : legal ? "yearly" : "monthly",
      priority: PRIORITY[key] ?? (legal ? 0.2 : 0.7),
    };
  });

  const news: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/news/${article.slug}`),
    lastModified: article.updated_at ?? article.published_at ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...fixed, ...news];
}

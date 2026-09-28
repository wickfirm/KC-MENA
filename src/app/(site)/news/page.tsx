import type { Metadata } from "next";
import Link from "next/link";
import { query } from "@/lib/db";
import { getListingContent } from "@/lib/listing-content";
import ListingPageShell from "@/components/site/ListingPageShell";
import "./news.css";
import "./news-source.css";

export const dynamic = "force-dynamic";

type NewsRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  category: string | null;
  published_at: string | null;
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getListingContent("news");
  return {
    title: content.hero.title,
    description: content.intro,
    alternates: { canonical: "https://kasumigaseki.ae/news/" },
  };
}

export default async function NewsPage() {
  const content = await getListingContent("news");
  let posts: NewsRow[] = [];
  try {
    posts = await query<NewsRow>(
      `SELECT id, slug, title, excerpt, cover_image, category, published_at
       FROM news_posts WHERE status = 'published'
       ORDER BY published_at DESC NULLS LAST LIMIT 24`
    );
  } catch {
    // DB unavailable — the page still renders the delivered design sections.
  }

  return (
    <ListingPageShell content={content}>
      {posts.length > 0 && (
        <div className="news-grid">
          {posts.map((p) => (
            <Link key={p.id} href={`/news/${p.slug}`} className="news-card">
              <div
                className="news-photo"
                style={{ backgroundImage: `url('${p.cover_image ?? "/images/city_tokyo.webp"}')` }}
              />
              <div className="news-body">
                <div className="tag">{p.category ?? "News"}</div>
                <h3 style={{ marginTop: 10, fontSize: "1.05rem", lineHeight: 1.4 }}>{p.title}</h3>
                {p.excerpt && <p style={{ marginTop: 8, fontSize: "0.88rem", color: "var(--grey-6)" }}>{p.excerpt}</p>}
                {p.published_at && (
                  <time style={{ display: "block", marginTop: 12, fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--grey-5)" }}>
                    {new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </time>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </ListingPageShell>
  );
}

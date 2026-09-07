import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import "../news.css";

export const dynamic = "force-dynamic";

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  category: string | null;
  published_at: string | null;
};

async function getPost(slug: string): Promise<Post | null> {
  try {
    return await queryOne<Post>(
      `SELECT id, slug, title, excerpt, body, cover_image, category, published_at
       FROM news_posts WHERE slug = $1 AND status = 'published'`,
      [slug]
    );
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "News" };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: `https://kasumigaseki.ae/news/${post.slug}` },
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const paragraphs = post.body.split(/\n{2,}/).filter(Boolean);
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <>
      <section
        className="hero-band"
        style={{ "--hero-image": `url('${post.cover_image ?? "/images/city_tokyo.webp"}')` } as React.CSSProperties}
      >
        <div className="wrap">
          <span className="hero-kicker eyebrow">{post.category ?? "News"}</span>
          <h1 style={{ fontSize: "clamp(1.6rem,3.6vw,2.6rem)", maxWidth: 900 }}>{post.title}</h1>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 46 }}>
        <div className="wrap">
          <article className="article-body">
            <div className="article-meta">
              {post.category && <span>{post.category}</span>}
              {dateStr && <span>{dateStr}</span>}
            </div>
            {post.excerpt && (
              <p style={{ marginTop: 18, fontSize: "1.08rem", color: "var(--grey-6)", fontFamily: "'Noto Serif', serif" }}>
                {post.excerpt}
              </p>
            )}
            <div style={{ marginTop: 24 }}>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p style={{ marginTop: 36 }}>
              <a href="/news/" style={{ fontWeight: 600, borderBottom: "1px solid var(--black)", paddingBottom: 2 }}>
                &larr; Back to News
              </a>
            </p>
          </article>
        </div>
      </section>

      <section className="section disclaimer">
        <div className="wrap">
          <h3>Disclaimer</h3>
          <p>The content above and in the linked materials is provided for general informational purposes only and does not constitute investment, legal, or tax advice. It should not be relied upon as the basis for any investment decision and does not represent an offer of advisory services or an offer to invest in any product, vehicle, or asset class. Any projections, estimates, forecasts, targets, or opinions expressed are subject to change without notice and may differ from views expressed by others. Certain information may be drawn from third-party sources; Kasumigaseki Capital has not independently verified such information and makes no representation as to its accuracy or completeness.</p>
        </div>
      </section>
    </>
  );
}

import type { CSSProperties } from "react";

export type NewsArticle = {
  title: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  category: string | null;
  published_at: string | null;
};

/** The public news article layout, shared by /news/[slug] and the admin draft preview. */
export default function NewsArticleView({ post }: { post: NewsArticle }) {
  const paragraphs = post.body.split(/\n{2,}/).filter(Boolean);
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <>
      <section
        className="hero-band"
        style={{ "--hero-image": `url('${post.cover_image ?? "/images/city_tokyo.webp"}')` } as CSSProperties}
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

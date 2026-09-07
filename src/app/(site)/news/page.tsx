import type { Metadata } from "next";
import Link from "next/link";
import { query } from "@/lib/db";
import "./news.css";

export const metadata: Metadata = {
  title: "News",
  description: "Latest local and international news of Kasumigaseki MENA and Kasumigaseki Capital.",
  alternates: { canonical: "https://kasumigaseki.ae/news/" },
};

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

export default async function NewsPage() {
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
    <>
      {/* HERO */}
      <section className="hero-band" style={{ "--hero-image": "url('/images/sales center b2.webp')" } as React.CSSProperties}>
        <div className="wrap">
          <h1>News</h1>
        </div>
      </section>

      {/* INTRO */}
      <section className="section" style={{ paddingBottom: 0, paddingTop: 40 }}>
        <div className="wrap">
          <div className="head" style={{ maxWidth: "none" }}>
            <h2 style={{ fontSize: "clamp(1.5rem,2.8vw,2.2rem)", lineHeight: 1.35, color: "var(--ink)", maxWidth: "none" }}>
              Latest News
            </h2>
            <p>Local and international news of Kasumigaseki, including external coverage and official updates from Kasumigaseki Capital.</p>
          </div>

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

          <div className="featured-video" aria-label="Featured video">
            <div className="featured-video-frame" aria-hidden="true">
              <div className="video-play"></div>
            </div>
            <div className="featured-video-copy">
              <span className="eyebrow">Featured Video</span>
              <h3 style={{ marginTop: 12 }}>Coming Soon</h3>
              <p>A dedicated space for future video announcements, leadership interviews, and project updates from Kasumigaseki MENA.</p>
            </div>
          </div>

          <div className="insight-grid">
            <a href="https://kasumigaseki.co.jp/en/news/" target="_blank" rel="noopener" className="insight-card">
              <div className="insight-photo" style={{ backgroundImage: "url('../images/city_tokyo.webp')" }}></div>
              <div className="insight-body">
                <div className="tag">Kasumigaseki Capital News</div>
              </div>
            </a>
            <a href="https://kasumigaseki.co.jp/en/ir/" target="_blank" rel="noopener" className="insight-card">
              <div className="insight-photo" style={{ backgroundImage: "url('../images/Reception kpd.webp')" }}></div>
              <div className="insight-body">
                <div className="tag">Investor Relations Updates</div>
              </div>
            </a>
            <a href="https://kasumigaseki.co.jp/en/" target="_blank" rel="noopener" className="insight-card">
              <div className="insight-photo" style={{ backgroundImage: "url('../images/logistics_home.webp')" }}></div>
              <div className="insight-body">
                <div className="tag">Kasumigaseki Capital Global Site</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="section disclaimer">
        <div className="wrap">
          <h3>Disclaimer</h3>
          <p>The content above and in the linked materials is provided for general informational purposes only and does not constitute investment, legal, or tax advice. It should not be relied upon as the basis for any investment decision and does not represent an offer of advisory services or an offer to invest in any product, vehicle, or asset class. Any projections, estimates, forecasts, targets, or opinions expressed are subject to change without notice and may differ from views expressed by others. Certain information may be drawn from third-party sources; Kasumigaseki Capital has not independently verified such information and makes no representation as to its accuracy or completeness.</p>
        </div>
      </section>
    </>
  );
}

import type { ReactNode } from "react";
import type { ListingContent } from "@/lib/listing-content";

/**
 * Editable chrome shared by the Careers / FAQ / News-index pages: hero band,
 * heading + introduction, and (news index only) the featured-video band,
 * external insight cards, and disclaimer. The data-driven list (jobs, FAQs,
 * posts) is passed through as children between the intro and the news extras.
 * Class names mirror the delivered static markup so the shared base styles apply.
 */
export default function ListingPageShell({ content, children }: { content: ListingContent; children?: ReactNode }) {
  const isNews = Boolean(content.featuredVideo || content.insightCards?.length || content.disclaimer);
  return (
    <>
      <section className="hero-band" style={{ "--hero-image": `url('${content.hero.image}')` } as React.CSSProperties}>
        <div className="wrap"><h1>{content.hero.title}</h1></div>
      </section>

      <section className="section" style={{ paddingTop: 46, paddingBottom: isNews ? undefined : undefined }}>
        <div className="wrap">
          <div className="head" style={{ maxWidth: "none" }}>
            {content.eyebrow && <span className="eyebrow">{content.eyebrow}</span>}
            <h2 style={{ fontSize: "clamp(1.5rem,2.8vw,2.2rem)", lineHeight: 1.35, color: "var(--ink)", maxWidth: "none" }}>
              {content.heading}
            </h2>
            <p>{content.intro}</p>
          </div>

          {children}

          {content.featuredVideo && (
            <div className="featured-video" aria-label="Featured video">
              <div className="featured-video-frame" aria-hidden="true">
                <div className="video-play"></div>
              </div>
              <div className="featured-video-copy">
                <span className="eyebrow">Featured Video</span>
                <h3 style={{ marginTop: 12 }}>{content.featuredVideo.heading}</h3>
                <p>{content.featuredVideo.body}</p>
              </div>
            </div>
          )}

          {content.insightCards && content.insightCards.length > 0 && (
            <div className="insight-grid">
              {content.insightCards.map((card) => (
                <a key={card.tag} href={card.href} target="_blank" rel="noopener" className="insight-card">
                  <div className="insight-photo" style={{ backgroundImage: `url('${card.image ?? "/images/city_tokyo.webp"}')` }}></div>
                  <div className="insight-body">
                    <div className="tag">{card.tag}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {content.disclaimer && (
        <section className="section disclaimer">
          <div className="wrap">
            <h3>Disclaimer</h3>
            <p>{content.disclaimer}</p>
          </div>
        </section>
      )}
    </>
  );
}
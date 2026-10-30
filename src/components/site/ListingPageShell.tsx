import ClientPageCss from "./ClientPageCss";
import { clientHeroBackground, type ClientPage } from "@/lib/client-css";
import type { ReactNode } from "react";
import type { ListingContent } from "@/lib/listing-content";
import TypeScope from "@/components/site/TypeScope";

/**
 * Editable chrome shared by the Careers / FAQ / News-index pages: hero band,
 * heading + introduction, and (news index only) the featured-video band,
 * external insight cards, and disclaimer. The data-driven list (jobs, FAQs,
 * posts) is passed through as children between the intro and the news extras.
 * Class names mirror the delivered static markup so the shared base styles apply.
 */
export default function ListingPageShell({ content, children, page = "news" }: { page?: ClientPage; content: ListingContent; children?: ReactNode }) {
  const isNews = Boolean(content.featuredVideo || content.insightCards?.length || content.disclaimer);
  return (
    <>
      <ClientPageCss page={page} />
      <TypeScope scale={content.type} scope="cms-listing">
      <section className="hero-band" style={clientHeroBackground(page, content.hero.image)}>
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
                {content.featuredVideo.eyebrow && <span className="eyebrow">{content.featuredVideo.eyebrow}</span>}
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
            {content.disclaimerHeading && <h3>{content.disclaimerHeading}</h3>}
            <p>{content.disclaimer}</p>
          </div>
        </section>
      )}
      </TypeScope>
    </>
  );
}
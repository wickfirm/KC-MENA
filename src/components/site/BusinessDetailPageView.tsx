import type { BusinessDetailContent } from "@/lib/business-detail-content";
import type { PublicProject } from "@/lib/projects";
import ProjectsSection from "./ProjectsSection";
import SectionContact from "./SectionContact";
import BusinessCalloutBand from "./BusinessCalloutBand";

const CONTACT_DEFAULTS = {
  officeTitle: "Dubai Office",
  officeLines: ["Dubai Hills Estate", "Business Park 4, Dubai, UAE", "Office 304-305"],
  mapUrl: "https://maps.app.goo.gl/xESmJtGHPZvotgkJ6",
  contactTitle: "Get in Touch",
  contactBody: "Reach the Kasumigaseki MENA team for corporate, investor, and business enquiries.",
  phone: "+971 43 88 3099",
  email: "info.dubai@kasumigaseki.co.jp",
};

export default function BusinessDetailPageView({ content, projects = [] }: { content: BusinessDetailContent; projects?: PublicProject[] }) {
  function splitSection(section: BusinessDetailContent["sections"][number], reversed: boolean) {
    const panel = <div className="biz-panel"><div className="biz-panel-inner"><span className="eyebrow">{section.eyebrow}</span><h2>{section.heading}</h2><div className="rule" /><p>{section.body}</p>{section.action && <a href={section.action.href} className="btn btn-outline-w" target={section.action.external ? "_blank" : undefined} rel={section.action.external ? "noreferrer" : undefined}>{section.action.label}</a>}</div></div>;
    const image = <div className="biz-photo" style={{ backgroundImage: `url('${section.image}')` }} />;
    return <section className={`biz-split${reversed ? " rev" : ""}`} key={`${section.eyebrow}-${section.heading}`}>{reversed ? <>{image}{panel}</> : <>{panel}{image}</>}</section>;
  }
  return (
    <main>
      <section className="hero-band" style={{ "--hero-image": `url('${content.hero.image}')` } as React.CSSProperties}>
        <div className="wrap"><h1>{content.hero.title}</h1></div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="head"><span className="eyebrow">{content.overview.eyebrow}</span><h2>{content.overview.heading}</h2></div>
          {content.metrics && <div className="stat-grid">{content.metrics.map((metric) => <div className="stat-block" key={metric.label}><div className="stat-num">{metric.value}</div><div className="stat-label">{metric.label}</div></div>)}</div>}
          {content.metricsSource && <div className="stat-foot"><a href={content.metricsSource.href} target="_blank" rel="noreferrer">&ldquo;{content.metricsSource.label}&rdquo;</a></div>}
        </div>
      </section>
      {content.bizBand && (
        <section className="biz-band" style={{ paddingTop: 36, paddingBottom: 0 }}>
          <div className="wrap">
            <div className="head">
              <span className="eyebrow">{content.bizBand.eyebrow}</span>
              <h2>{content.bizBand.heading}</h2>
              <p>{content.bizBand.body}</p>
            </div>
          </div>
        </section>
      )}
      {content.sections.map((section, index) => splitSection(section, index % 2 === 1))}
      {content.callouts?.map((callout) => <BusinessCalloutBand key={callout.heading} callout={callout} locations={content.locations} />)}
      <ProjectsSection projects={projects} heading={content.projectsHeading || "Selected projects"} />
      {content.contactSection && (
        <SectionContact
          heading="Let our team get back to you."
          officeTitle={CONTACT_DEFAULTS.officeTitle}
          officeLines={CONTACT_DEFAULTS.officeLines}
          mapUrl={CONTACT_DEFAULTS.mapUrl}
          contactTitle={CONTACT_DEFAULTS.contactTitle}
          contactBody={CONTACT_DEFAULTS.contactBody}
          phone={CONTACT_DEFAULTS.phone}
          email={CONTACT_DEFAULTS.email}
        />
      )}
    </main>
  );
}

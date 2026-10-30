import ClientPageCss from "./ClientPageCss";
import { clientHeroBackground, type ClientPage } from "@/lib/client-css";
import type { BusinessDetailContent } from "@/lib/business-detail-content";
import type { PublicProject } from "@/lib/projects";
import ProjectsSection from "./ProjectsSection";
import SectionContact from "./SectionContact";
import BusinessCalloutBand from "./BusinessCalloutBand";
import { typeRules } from "@/lib/type-style";
import TypeScope from "@/components/site/TypeScope";

export default function BusinessDetailPageView({ content, projects = [], referenceOverviewWidth = false, page }: { page: ClientPage; content: BusinessDetailContent; projects?: PublicProject[]; referenceOverviewWidth?: boolean }) {
  function splitSection(section: BusinessDetailContent["sections"][number], index: number) {
    const reversed = index % 2 === 1;
    const scope = `cms-biz-${index}`;
    const sectionCss = typeRules(section.typeStyle, `.${scope}`);
    if (section.hidden) return null;
    const panel = <div className="biz-panel"><div className="biz-panel-inner"><span className="eyebrow">{section.eyebrow}</span><h2>{section.heading}</h2><div className="rule" /><p>{section.body}</p>{section.action && !section.action.hidden && section.action.label && <a href={section.action.href} className="btn btn-outline-w" target={section.action.external ? "_blank" : undefined} rel={section.action.external ? "noreferrer" : undefined}>{section.action.label}</a>}</div></div>;
    const image = <div className="biz-photo" style={{ backgroundImage: `url('${section.image}')` }} />;
    return <section className={`biz-split${reversed ? " rev" : ""} ${scope}`} key={`${section.eyebrow}-${section.heading}`}>{sectionCss ? <style>{sectionCss}</style> : null}{reversed ? <>{image}{panel}</> : <>{panel}{image}</>}</section>;
  }
  return (
    <>
    <ClientPageCss page={page} />
    <TypeScope scale={content.type} scope="cms-business"><main>
      <section className="hero-band" style={clientHeroBackground(page, content.hero.image)}>
        <div className="wrap"><h1>{content.hero.title}</h1></div>
      </section>
      <section className="section biz-platform">
        <div className="wrap">
          {content.platformMetrics ? <>
            {content.overview.eyebrow ? <span className="eyebrow">{content.overview.eyebrow}</span> : null}
            <h2 style={{ fontSize: "clamp(1.6rem,2.6vw,2.15rem)", maxWidth: "26ch", marginTop: content.overview.eyebrow ? 16 : undefined }}>{content.overview.heading}</h2>
            {content.overview.body && <p className="intro-reg" style={{ marginTop: 18 }}>{content.overview.body}</p>}
            <div className="numbers-platform">
              <div className="hero-nums">{content.platformMetrics.primary.map((metric) => <div className="hero-num-block" key={metric.label}><div className="hero-num">{metric.value}</div><div className="hero-num-label">{metric.label} <sup>1</sup></div></div>)}</div>
              <div className="sec-list">{content.platformMetrics.sectors.map((metric) => <div className="sec-row" key={metric.label}><div className="sec-num">{metric.value}</div><div className="sec-label">{metric.label}<span>{metric.detail}</span></div></div>)}</div>
            </div>
            <div className="track-foot"><a href={content.platformMetrics.source.href} target="_blank" rel="noreferrer">"{content.platformMetrics.source.label}"</a></div>
          </> : <>
            <div className={`head${referenceOverviewWidth ? " business-detail-overview" : ""}`}><span className="eyebrow">{content.overview.eyebrow}</span><h2>{content.overview.heading}</h2></div>
            {content.metrics && <div className="stat-grid">{content.metrics.map((metric) => <div className="stat-block" key={metric.label}><div className="stat-num">{metric.value}</div><div className="stat-label">{metric.label}</div></div>)}</div>}
            {content.metricsSource && <div className="stat-foot"><a href={content.metricsSource.href} target="_blank" rel="noreferrer">"{content.metricsSource.label}"</a></div>}
          </>}
        </div>
      </section>
      {content.bizBand && (
        <section className="biz-band" style={{ paddingTop: 36, paddingBottom: 0 }}>
          <div className="wrap">
            <div className="head">
              {content.bizBand.eyebrow ? <span className="eyebrow">{content.bizBand.eyebrow}</span> : null}
              <h2>{content.bizBand.heading}</h2>
              {content.bizBand.body ? <p>{content.bizBand.body}</p> : null}
            </div>
          </div>
        </section>
      )}
      {content.sections.map((section, index) => splitSection(section, index))}
      {content.callouts?.map((callout) => <BusinessCalloutBand key={callout.heading} callout={callout} locations={content.locations} />)}
      {content.projectsHeading && <ProjectsSection projects={projects} eyebrow={content.projectsEyebrow} heading={content.projectsHeading} />}
      {content.contactSection && content.contact && !content.contact.hidden && (
        <SectionContact
          eyebrow={content.contact.eyebrow}
          heading={content.contact.heading}
          officeTitle={content.contact.officeLabel}
          officeLines={content.contact.officeLines}
          mapUrl={content.contact.mapUrl}
          mapLabel={content.contact.mapLabel}
          contactTitle={content.contact.contactLabel}
          contactBody={content.contact.body}
          phone={content.contact.phone}
          email={content.contact.email}
          subjectLabel={content.contact.subjectLabel}
          subjectPlaceholder={content.contact.subjectPlaceholder}
          submitLabel={content.contact.submitLabel}
          successMessage={content.contact.successMessage}
          nameLabel={content.contact.nameLabel}
          emailLabel={content.contact.emailLabel}
          phoneLabel={content.contact.phoneLabel}
          messageLabel={content.contact.messageLabel}
          hidden={content.contact.hidden}
          recipientEmail={content.contact.recipientEmail}
          emailSubject={content.contact.emailSubject}
          delivery={content.contact.delivery}
          errorMessage={content.contact.errorMessage}
        />
      )}
    </main></TypeScope>
    </>
  );
}

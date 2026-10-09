import Link from "next/link";
import type { LocalBusinessContent } from "@/lib/local-business-content";
import type { PublicProject } from "@/lib/projects";
import ProjectsSection from "@/components/site/ProjectsSection";
import SectionContact from "@/components/site/SectionContact";

export default function LocalBusinessPageView({ content, projects = [] }: { content: LocalBusinessContent; projects?: PublicProject[] }) {
  const c = content.contact;
  return (
    <main>
      <section className="hero-band" style={{ "--hero-image": `url('${content.hero.image}')` } as React.CSSProperties}>
        <div className="wrap"><h1>{content.hero.title}</h1></div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="head"><span className="eyebrow">By The Numbers</span><h2>{content.intro.heading}</h2></div>
          <div className="stat-grid">
            {content.intro.metrics.map((x) => (
              <div className="stat-block" key={x.label}><div className="stat-num">{x.value}</div><div className="stat-label">{x.label}</div></div>
            ))}
          </div>
          {content.intro.footnote && <a className="stat-footnote" href={content.intro.footnote.href} target="_blank" rel="noopener">{content.intro.footnote.label}</a>}
        </div>
      </section>
      {content.panels.map((x, i) => {
        const panel = <div className="biz-panel">
            <div className="biz-panel-inner">
              <span className="eyebrow">{x.eyebrow}</span>
              <h2>{x.heading}</h2>
              <div className="rule" />
              <p>{x.body}</p>
              <Link href={x.href} className="btn btn-outline-w">Know More</Link>
            </div>
          </div>;
        const image = <div className="biz-photo" style={{ backgroundImage: `url('${x.image}')` }} />;
        return <section className={`biz-split${i === 1 ? " rev" : ""}`} key={x.eyebrow}>{i === 1 ? <>{image}{panel}</> : <>{panel}{image}</>}</section>;
      })}
      <SectionContact
        eyebrow={c.eyebrow}
        heading={c.heading}
        officeTitle={c.officeLabel}
        officeLines={c.address.split("\n")}
        mapUrl={c.mapUrl}
        mapLabel={c.mapLabel}
        contactTitle={c.contactLabel}
        contactBody={c.body}
        phone={c.phone}
        email={c.email}
        subjectLabel="Enquiry Type"
        subjectPlaceholder="Development, Investment, F&B..."
      />
      <ProjectsSection projects={projects} heading="Projects in the UAE" />
    </main>
  );
}

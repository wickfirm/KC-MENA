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
        </div>
      </section>
      {content.panels.map((x, i) => (
        <section className={`biz-split${i === 1 ? " rev" : ""}`} key={x.eyebrow}>
          <div className="biz-panel">
            <div className="biz-panel-inner">
              <span className="eyebrow">{x.eyebrow}</span>
              <h2>{x.heading}</h2>
              <div className="rule" />
              <p>{x.body}</p>
              <Link href={x.href} className="btn btn-outline-w">Know More</Link>
            </div>
          </div>
          <div className="biz-photo" style={{ backgroundImage: `url('${x.image}')` }} />
        </section>
      ))}
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

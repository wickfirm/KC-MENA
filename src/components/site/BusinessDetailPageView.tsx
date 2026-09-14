import type { BusinessDetailContent } from "@/lib/business-detail-content";

export default function BusinessDetailPageView({ content }: { content: BusinessDetailContent }) {
  return (
    <main>
      <section className="hero-band" style={{ "--hero-image": `url('${content.hero.image}')` } as React.CSSProperties}>
        <div className="wrap"><h1>{content.hero.title}</h1></div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="head"><span className="eyebrow">{content.overview.eyebrow}</span><h2>{content.overview.heading}</h2></div>
        </div>
      </section>
      {content.metrics && <section className="section" style={{ paddingTop: 0 }}><div className="wrap"><div className="stat-grid">{content.metrics.map((metric) => <div className="stat-block" key={metric.label}><div className="stat-num">{metric.value}</div><div className="stat-label">{metric.label}</div></div>)}</div></div></section>}
      {content.sections.map((section, index) => (
        <section className={`biz-split${index % 2 ? " rev" : ""}`} key={`${section.eyebrow}-${index}`}>
          <div className="biz-panel"><div className="biz-panel-inner"><span className="eyebrow">{section.eyebrow}</span><h2>{section.heading}</h2><div className="rule" /><p>{section.body}</p></div></div>
          <div className="biz-photo" style={{ backgroundImage: `url('${section.image}')` }} />
        </section>
      ))}
      {content.callouts?.map((callout) => <section className="section" key={callout.heading} style={{ background: "var(--grey-1)" }}><div className="wrap"><span className="eyebrow">{callout.eyebrow}</span><h2 style={{ marginTop: 12 }}>{callout.heading}</h2><p style={{ maxWidth: 650, marginTop: 12 }}>{callout.body}</p><a className="btn btn-outline" href={callout.href} target="_blank" rel="noreferrer" style={{ marginTop: 22 }}>{callout.label}</a></div></section>)}
    </main>
  );
}

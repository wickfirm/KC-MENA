import type { BusinessDetailContent } from "@/lib/business-detail-content";

export default function BusinessDetailPageView({ content }: { content: BusinessDetailContent }) {
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
        </div>
      </section>
      {content.metrics && <section className="section"><div className="wrap"><div className="stat-grid">{content.metrics.map((metric) => <div className="stat-block" key={metric.label}><div className="stat-num">{metric.value}</div><div className="stat-label">{metric.label}</div></div>)}</div>{content.metricsSource && <div className="stat-foot"><a href={content.metricsSource.href} target="_blank" rel="noreferrer">&ldquo;{content.metricsSource.label}&rdquo;</a></div>}</div></section>}
      {content.sections.map((section, index) => splitSection(section, index % 2 === 1))}
      {content.callouts?.map((callout) => <section className="section" key={callout.heading} style={{ background: "var(--grey-1)" }}><div className="wrap"><span className="eyebrow">{callout.eyebrow}</span><h2 style={{ marginTop: 12 }}>{callout.heading}</h2><p style={{ maxWidth: 650, marginTop: 12 }}>{callout.body}</p><a className="btn btn-outline" href={callout.href} target="_blank" rel="noreferrer" style={{ marginTop: 22 }}>{callout.label}</a></div></section>)}
    </main>
  );
}

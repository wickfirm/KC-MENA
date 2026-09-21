import Link from "next/link";
import type { ContentModule, ModuleDocument } from "@/lib/content-modules";
import HomeLeadForm from "@/components/site/HomeLeadForm";

type ModuleOf<T extends ContentModule["type"]> = Extract<ContentModule, { type: T }>;

function findModule<T extends ContentModule["type"]>(document: ModuleDocument, id: string, type: T): ModuleOf<T> | null {
  const module = document.modules.find((candidate) => candidate.id === id && candidate.type === type);
  return (module as ModuleOf<T> | undefined) ?? null;
}

function SectionHeading({ eyebrow, heading, body }: { eyebrow?: string; heading: string; body?: string }) {
  return <div className="section-head"><span className="eyebrow">{eyebrow}</span><h2>{heading}</h2>{body && <p>{body}</p>}</div>;
}

export default function HomePageView({ document }: { document: ModuleDocument }) {
  const hero = findModule(document, "hero", "hero");
  const about = findModule(document, "about", "rich-text");
  const metrics = findModule(document, "group-metrics", "metrics");
  const local = findModule(document, "local-businesses", "feature-grid");
  const locations = findModule(document, "locations", "location-grid");
  const global = findModule(document, "global-businesses", "feature-grid");
  const newsUpdates = findModule(document, "news-updates", "media-grid");
  const contact = findModule(document, "contact", "call-to-action");

  return <main className="page-home">
    {hero && <section className="hero">
      {hero.videoSrc && <video className="hero-video" autoPlay muted loop playsInline preload="metadata" poster={hero.image?.src} aria-hidden="true"><source src={hero.videoSrc} type="video/mp4" /></video>}
      <div className="hero-content"><h1>{hero.heading}</h1>{hero.body && <p className="hero-sub">{hero.body}</p>}</div><div className="scroll-hint">Scroll</div>
    </section>}

    {(about || metrics) && <section className="about" id="about"><div className="wrap"><div className="about-platform">
      {about && <div className="about-left"><span className="eyebrow">{about.eyebrow}</span><div className="eyebrow-rule" /><h2>{about.body}</h2></div>}
      {metrics && <div className="about-right"><div className="stat-row"><div className="stat-big">{metrics.items[0]?.value}</div><div className="stat-label">{metrics.items[0]?.label}</div></div><div className="stat-row"><div className="stat-big">{metrics.items[1]?.value}</div><div className="stat-label">{metrics.items[1]?.label}</div></div><div className="stat-row"><div className="stat-big">{metrics.items[2]?.value}</div><div className="stat-label">{metrics.items[2]?.label}</div></div><div className="stat-row split"><div className="stat-half"><div className="stat-big-sm">{metrics.items[3]?.value}</div><div className="stat-label">{metrics.items[3]?.label}</div></div><div className="stat-half"><div className="stat-big-sm">{metrics.items[4]?.value}</div><div className="stat-label">{metrics.items[4]?.label}</div></div></div><div className="stat-actions"><div className="stat-footnote"><a href="https://kasumigaseki.co.jp/en/ir/" target="_blank" rel="noopener">As of February 28, 2026</a></div><a className="stat-know-more" href="https://kasumigaseki.co.jp/en/" target="_blank" rel="noopener">Know more</a></div></div>}
    </div></div></section>}

    {local && <section className="section" id="local"><div className="wrap"><SectionHeading eyebrow={local.eyebrow} heading={local.heading} body={local.body} /><div className="biz-grid">{local.items.map((item, index) => <article className="biz-card" key={item.title}><div className="biz-photo" style={{ backgroundImage: item.image ? `url('${item.image.src}')` : undefined }} /><div className="biz-body"><span className="num">{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3>{item.body && <p>{item.body}</p>}{item.link && <Link href={item.link.href} className="go">{item.link.label} <span aria-hidden="true">→</span></Link>}</div></article>)}</div></div></section>}

    {locations && <section className="section locations" id="locations"><div className="wrap"><SectionHeading eyebrow={locations.eyebrow} heading={locations.heading} body={locations.body} /><div className="loc-grid">{locations.locations.map((location) => <article className="loc-card" key={location.city}><div className="loc-photo"><img src={location.image.src} alt={location.image.alt} loading="lazy" /></div><div className="loc-body"><span className="tag">{location.label}</span><div className="city">{location.city}</div><p className="addr">{location.address}</p>{location.mapLink && <a className="loc-maplink" href={location.mapLink.href} target={location.mapLink.external ? "_blank" : undefined} rel={location.mapLink.external ? "noopener" : undefined}>{location.mapLink.label} <span aria-hidden="true">↗</span></a>}</div></article>)}</div></div></section>}

    {global && <section className="section global-band" id="global"><div className="wrap"><SectionHeading eyebrow={global.eyebrow} heading={global.heading} /><div className="principles-grid">{global.items.map((item) => <article className="principle" key={item.title}><div className="global-photo-sm" style={{ backgroundImage: item.image ? `url('${item.image.src}')` : undefined }} /><h4>{item.title}</h4>{item.body && <p>{item.body}</p>}{item.tags && <div className="chips">{item.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div>}</article>)}</div></div></section>}

    {newsUpdates && <section className="section global-band" id="news-updates"><div className="wrap"><span className="eyebrow eyebrow-on-black">{newsUpdates.eyebrow}</span><div className="principles-grid">{newsUpdates.items.map((item) => <article className="principle" key={item.title}>{item.videoSrc ? <div className="global-photo-sm video-card"><video autoPlay muted loop playsInline preload="metadata" poster={item.image?.src} aria-label={item.image?.alt ?? item.title}><source src={item.videoSrc} type="video/mp4" /></video><div className="video-controls-overlay" aria-label="Video controls"><button className="video-action video-sound-toggle is-muted" type="button" aria-label="Turn sound on" title="Turn sound on"><span className="sound-icon" aria-hidden="true" /></button><button className="video-action video-fullscreen-toggle" type="button" aria-label="Expand video to fullscreen" title="Expand video to fullscreen"><span className="fullscreen-icon" aria-hidden="true" /></button></div></div> : <div className="global-photo-sm" style={{ backgroundImage: item.image ? `url('${item.image.src}')` : undefined }} />}{item.link ? <h4><a href={item.link.href} target={item.link.external ? "_blank" : undefined} rel={item.link.external ? "noopener" : undefined}>{item.title}</a></h4> : <h4>{item.title}</h4>}{item.body && <p>{item.body}</p>}{item.tags && <div className="chips">{item.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div>}</article>)}</div></div></section>}

    {contact && <section className="section lead" id="lead"><div className="wrap"><div className="lead-grid"><div><span className="eyebrow">{contact.eyebrow}</span><h2>{contact.heading}</h2>{contact.body && <p>{contact.body}</p>}</div><HomeLeadForm /></div></div></section>}
  </main>;
}

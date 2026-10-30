import type { CSSProperties } from "react";
import Link from "next/link";
import type { ContentModule, ModuleDocument } from "@/lib/content-modules";
import { showLink } from "@/lib/content-modules";
import HomeLeadForm from "@/components/site/HomeLeadForm";
import HomeVideoCard from "@/components/site/HomeVideoCard";
import { typeStyle, type TypeRole, type TypeScale } from "@/lib/type-style";

type ModuleOf<T extends ContentModule["type"]> = Extract<ContentModule, { type: T }>;

function findModule<T extends ContentModule["type"]>(document: ModuleDocument, id: string, type: T): ModuleOf<T> | null {
  const module = document.modules.find((candidate) => candidate.id === id && candidate.type === type);
  return (module as ModuleOf<T> | undefined) ?? null;
}

function SectionHeading({ eyebrow, heading, body, look }: { eyebrow?: string; heading: string; body?: string; look: (role: TypeRole) => CSSProperties | undefined }) {
  return <div className="section-head">{eyebrow && <span className="eyebrow" style={look("eyebrow")}>{eyebrow}</span>}<h2 style={look("heading")}>{heading}</h2>{body && <p style={look("body")}>{body}</p>}</div>;
}

/** The delivered markup sets a trailing footnote marker as <sup>; the CMS stores it as a superscript digit. */
function StatLabel({ text = "" }: { text?: string }) {
  const m = text.match(/^(.*?)\s*([¹²³])$/);
  if (!m) return <>{text}</>;
  return <>{m[1]} <sup>{"¹²³".indexOf(m[2]) + 1}</sup></>;
}

export default function HomePageView({ document, siteType }: { document: ModuleDocument; siteType?: TypeScale }) {
  const hero = findModule(document, "hero", "hero");
  const about = findModule(document, "about", "rich-text");
  const metrics = findModule(document, "group-metrics", "metrics");
  const local = findModule(document, "local-businesses", "feature-grid");
  const locations = findModule(document, "locations", "location-grid");
  const global = findModule(document, "global-businesses", "feature-grid");
  const newsUpdates = findModule(document, "news-updates", "media-grid");
  const contact = findModule(document, "contact", "call-to-action");
  const look = (section: TypeScale | undefined, role: TypeRole) => typeStyle(siteType, document.type, section, role);

  return <main className="page-home">
    {hero && !hero.hidden && <section className="hero">
      {hero.videoSrc && <video className="hero-video" autoPlay muted loop playsInline preload="metadata" poster={hero.image?.src} aria-hidden="true"><source src={hero.videoSrc} type="video/mp4" /></video>}
      <div className="hero-content"><h1 style={look(hero.typeStyle, "title")}>{hero.heading}</h1>{hero.body && <p className="hero-sub" style={look(hero.typeStyle, "body")}>{hero.body}</p>}</div>{hero.scrollLabel && <div className="scroll-hint">{hero.scrollLabel}</div>}
    </section>}

    {(about || metrics) && <section className="about" id="about"><div className="wrap"><div className="about-platform">
      {about && !about.hidden && <div className="about-left"><span className="eyebrow" style={look(about.typeStyle, "eyebrow")}>{about.eyebrow}</span><div className="eyebrow-rule" />{about.heading ? <h2 style={look(about.typeStyle, "heading")}>{about.heading}</h2> : <h2 style={look(about.typeStyle, "heading")}>{about.body}</h2>}{about.heading && about.body ? <p style={look(about.typeStyle, "body")}>{about.body}</p> : null}</div>}
      {metrics && !metrics.hidden && <div className="about-right" style={{ cursor: "default" }}><div className="stat-row"><div className="stat-big">{metrics.items[0]?.value}</div><div className="stat-label"><StatLabel text={metrics.items[0]?.label} /></div></div><div className="stat-row"><div className="stat-big">{metrics.items[1]?.value}</div><div className="stat-label"><StatLabel text={metrics.items[1]?.label} /></div></div><div className="stat-row"><div className="stat-big">{metrics.items[2]?.value}</div><div className="stat-label"><StatLabel text={metrics.items[2]?.label} /></div></div><div className="stat-row split"><div className="stat-half"><div className="stat-big-sm">{metrics.items[3]?.value}</div><div className="stat-label"><StatLabel text={metrics.items[3]?.label} /></div></div><div className="stat-half"><div className="stat-big-sm">{metrics.items[4]?.value}</div><div className="stat-label"><StatLabel text={metrics.items[4]?.label} /></div></div></div><div className="stat-actions">{metrics.source && <div className="stat-footnote"><a href={metrics.source.href} target="_blank" rel="noopener">{metrics.source.label}</a></div>}{showLink(metrics.action) && <a className="stat-know-more" href={metrics.action!.href} target="_blank" rel="noopener" style={look(metrics.typeStyle, "button")}>{metrics.action!.label}</a>}</div></div>}
    </div></div></section>}

    {local && !local.hidden && <section className="section" id="local"><div className="wrap"><SectionHeading eyebrow={local.eyebrow} heading={local.heading} body={local.body} look={(role) => look(local.typeStyle, role)} /><div className="biz-grid">{local.items.map((item, index) => <article className="biz-card" key={item.title}><div className="biz-photo" style={{ backgroundImage: item.image ? `url('${item.image.src}')` : undefined }} /><div className="biz-body"><span className="num">{String(index + 1).padStart(2, "0")}</span><h3 style={look(local.typeStyle, "heading")}>{item.title}</h3>{item.body && <p style={look(local.typeStyle, "body")}>{item.body}</p>}{showLink(item.link) && <Link href={item.link!.href} className="go" style={look(local.typeStyle, "button")}>{item.link!.label} <span aria-hidden="true">→</span></Link>}</div></article>)}</div></div></section>}

    {locations && !locations.hidden && <section className="section locations" id="locations"><div className="wrap"><SectionHeading eyebrow={locations.eyebrow} heading={locations.heading} body={locations.body} look={(role) => look(locations.typeStyle, role)} /><div className="loc-grid">{locations.locations.map((location) => <article className="loc-card" key={location.city}><div className="loc-photo"><img src={location.image.src} alt={location.image.alt} loading="lazy" /></div><div className="loc-body"><span className="tag">{location.label}</span><div className="city">{location.city}</div><p className="addr">{location.address}</p>{showLink(location.mapLink) && <a className="loc-maplink" href={location.mapLink!.href} target={location.mapLink!.external ? "_blank" : undefined} rel={location.mapLink!.external ? "noopener" : undefined} style={look(locations.typeStyle, "button")}>{location.mapLink!.label} <span aria-hidden="true">↗</span></a>}</div></article>)}</div></div></section>}

    {global && !global.hidden && <section className="section global-band" id="global"><div className="wrap"><span className="eyebrow eyebrow-on-black">{global.eyebrow}</span><h2 style={{ color: "var(--white)", fontSize: "1.6rem", marginTop: 16, maxWidth: "32ch" }}>{global.heading}</h2>{global.body ? <p className="home-global-intro">{global.body}</p> : null}<div className="principles-grid">{global.items.map((item) => <article className="principle" key={item.title}><div className="global-photo-sm" style={{ backgroundImage: item.image ? `url('${item.image.src}')` : undefined }} /><h4>{item.title}</h4>{item.body && <p>{item.body}</p>}{item.tags && <div className="chips">{item.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div>}</article>)}</div></div></section>}

    {newsUpdates && !newsUpdates.hidden && <section className="section global-band" id="news-updates"><div className="wrap"><span className="eyebrow eyebrow-on-black">{newsUpdates.eyebrow}</span><div className="principles-grid">{newsUpdates.items.map((item) => <article className="principle" key={item.title}>{item.videoSrc ? <HomeVideoCard videoSrc={item.videoSrc} poster={item.image?.src} alt={item.image?.alt ?? item.title} /> : <div className="global-photo-sm" style={{ backgroundImage: item.image ? `url('${item.image.src}')` : undefined }} />}{item.link ? <h4><a href={item.link.href} target={item.link.external ? "_blank" : undefined} rel={item.link.external ? "noopener" : undefined}>{item.title}</a></h4> : <h4>{item.title}</h4>}{item.body && <p>{item.body}</p>}{item.tags && <div className="chips">{item.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div>}</article>)}</div></div></section>}

    {contact && !contact.hidden && !contact.form?.hidden && <section className="section lead" id="lead"><div className="wrap"><div className="lead-grid"><div><span className="eyebrow" style={look(contact.typeStyle, "eyebrow")}>{contact.eyebrow}</span><h2 style={look(contact.typeStyle, "heading")}>{contact.heading}</h2>{contact.body && <p style={look(contact.typeStyle, "body")}>{contact.body}</p>}</div><HomeLeadForm form={contact.form} /></div></div></section>}
  </main>;
}

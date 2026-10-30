"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentModule, ModuleDocument } from "@/lib/content-modules";
import MediaPicker from "@/components/admin/MediaPicker";
import TypeFields, { readTypeScale } from "@/components/admin/TypeFields";

type ModuleOf<T extends ContentModule["type"]> = Extract<ContentModule, { type: T }>;
type Props = { content: ModuleDocument; status: "draft" | "published"; seo: { title?: string; description?: string } };

function getModule<T extends ContentModule["type"]>(document: ModuleDocument, id: string, type: T): ModuleOf<T> {
  const module = document.modules.find((candidate) => candidate.id === id && candidate.type === type);
  if (!module) throw new Error(`Home configuration is missing ${id}.`);
  return module as ModuleOf<T>;
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5, color: "var(--grey-5)" };
const sectionStyle: React.CSSProperties = { marginTop: 26, paddingTop: 24, borderTop: "1px solid var(--line)" };

function Field({ name, label, value, multiline = false }: { name: string; label: string; value?: string; multiline?: boolean }) {
  return <div style={{ marginBottom: 14 }}><label htmlFor={name} style={labelStyle}>{label}</label>{multiline ? <textarea id={name} name={name} rows={3} defaultValue={value ?? ""} /> : <input id={name} name={name} defaultValue={value ?? ""} />}</div>;
}

export default function HomeEditor({ content, status, seo }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
  const hero = getModule(content, "hero", "hero");
  const about = getModule(content, "about", "rich-text");
  const metrics = getModule(content, "group-metrics", "metrics");
  const local = getModule(content, "local-businesses", "feature-grid");
  const locations = getModule(content, "locations", "location-grid");
  const global = getModule(content, "global-businesses", "feature-grid");
  const newsUpdates = getModule(content, "news-updates", "media-grid");
  const contact = getModule(content, "contact", "call-to-action");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const on = (name: string) => form.get(name) === "on";
    const next = structuredClone(content);
    next.type = readTypeScale(value, "page");
    const nextHero = getModule(next, "hero", "hero");
    nextHero.hidden = on("hero-hidden");
    nextHero.typeStyle = readTypeScale(value, "hero");
    nextHero.heading = value("hero-heading"); nextHero.body = value("hero-body"); nextHero.scrollLabel = value("hero-scroll") || undefined; nextHero.videoSrc = value("hero-video") || undefined;
    nextHero.image = { src: value("hero-poster"), alt: value("hero-poster-alt") };
    const nextAbout = getModule(next, "about", "rich-text");
    nextAbout.hidden = on("about-hidden"); nextAbout.typeStyle = readTypeScale(value, "about");
    nextAbout.eyebrow = value("about-eyebrow"); nextAbout.heading = value("about-heading"); nextAbout.body = value("about-body");
    const nextMetrics = getModule(next, "group-metrics", "metrics");
    nextMetrics.items = metrics.items.map((item, index) => ({ ...item, value: value(`metric-value-${index}`), label: value(`metric-label-${index}`) }));
    nextMetrics.hidden = on("metrics-hidden"); nextMetrics.typeStyle = readTypeScale(value, "metrics");
    nextMetrics.source = { label: value("metrics-source-label"), href: value("metrics-source-href"), hidden: on("metrics-source-hidden") };
    nextMetrics.action = { label: value("metrics-action-label"), href: value("metrics-action-href"), external: true, hidden: on("metrics-action-hidden") };
    const nextLocal = getModule(next, "local-businesses", "feature-grid");
    nextLocal.hidden = on("local-hidden"); nextLocal.typeStyle = readTypeScale(value, "local");
    nextLocal.eyebrow = value("local-eyebrow"); nextLocal.heading = value("local-heading"); nextLocal.body = value("local-body"); nextLocal.items = local.items.map((item, index) => ({ ...item, title: value(`local-title-${index}`), body: value(`local-body-${index}`), image: { src: value(`local-image-${index}`), alt: value(`local-image-alt-${index}`) }, link: { label: value(`local-link-label-${index}`), href: value(`local-link-${index}`), hidden: on(`local-link-hidden-${index}`) } }));
    const nextLocations = getModule(next, "locations", "location-grid");
    nextLocations.hidden = on("locations-hidden"); nextLocations.typeStyle = readTypeScale(value, "locations");
    nextLocations.eyebrow = value("locations-eyebrow"); nextLocations.heading = value("locations-heading"); nextLocations.body = value("locations-body"); nextLocations.locations = locations.locations.map((item, index) => ({ ...item, label: value(`location-label-${index}`), city: value(`location-city-${index}`), address: value(`location-address-${index}`), image: { src: value(`location-image-${index}`), alt: value(`location-image-alt-${index}`) }, mapLink: { label: value(`location-map-label-${index}`), href: value(`location-map-${index}`), external: true, hidden: on(`location-map-hidden-${index}`) } }));
    const nextGlobal = getModule(next, "global-businesses", "feature-grid");
    nextGlobal.eyebrow = value("global-eyebrow"); nextGlobal.heading = value("global-heading"); nextGlobal.body = value("global-body"); nextGlobal.items = global.items.map((item, index) => ({ ...item, title: value(`global-title-${index}`), body: value(`global-body-${index}`), image: { src: value(`global-image-${index}`), alt: value(`global-image-alt-${index}`) }, tags: value(`global-tags-${index}`).split(",").map((tag) => tag.trim()).filter(Boolean) }));
    const nextNewsUpdates = getModule(next, "news-updates", "media-grid");
    nextNewsUpdates.eyebrow = value("news-updates-eyebrow"); nextNewsUpdates.items = newsUpdates.items.map((item, index) => ({ ...item, title: value(`news-title-${index}`), body: value(`news-body-${index}`), image: { src: value(`news-image-${index}`), alt: value(`news-image-alt-${index}`) }, videoSrc: value(`news-video-${index}`) || undefined, link: { label: value(`news-title-${index}`), href: value(`news-link-${index}`), external: item.link?.external }, tags: value(`news-tags-${index}`).split(",").map((tag) => tag.trim()).filter(Boolean) }));
    const nextContact = getModule(next, "contact", "call-to-action");
    nextContact.eyebrow = value("contact-eyebrow"); nextContact.heading = value("contact-heading"); nextContact.body = value("contact-body");
    nextContact.hidden = on("contact-hidden"); nextContact.typeStyle = readTypeScale(value, "contact");
    nextContact.form = { nameLabel: value("form-name"), emailLabel: value("form-email"), emailPlaceholder: value("form-email-placeholder"), phoneLabel: value("form-phone"), interestLabel: value("form-interest"), interests: value("form-interests").split("\n").map((item) => item.trim()).filter(Boolean), messageLabel: value("form-message"), submitLabel: value("form-submit"), consent: value("form-consent"), successMessage: value("form-success"), errorMessage: value("form-error"), recipientEmail: value("form-recipient"), emailSubject: value("form-subject"), delivery: (value("form-delivery") || "both") as "inbox" | "email" | "both", hidden: on("form-hidden") };
    const payload = { status: value("status"), seo: { title: value("seo-title"), description: value("seo-description") }, content: next };
    try {
      const response = await fetch("/api/site-pages/home", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Save failed");
      router.refresh();
      setNotice(String(form.get("status")) === "published" ? "Saved and published — the change is live on the public site." : "Saved as a DRAFT — the public page is unchanged. Set Status to Published and save again to go live.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Save failed"); }
    finally { setSaving(false); }
  }

  return <form onSubmit={save} className="card" style={{ maxWidth: 960 }}>
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 16 }}><div><label htmlFor="status" style={labelStyle}>Status</label><select id="status" name="status" defaultValue={status}><option value="draft">Draft</option><option value="published">Published</option></select></div><Field name="seo-title" label="SEO title" value={seo.title} /></div>
    <Field name="seo-description" label="SEO description" value={seo.description} multiline />
    <TypeFields prefix="page" value={content.type} legend="This page — overrides the site-wide type" />
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Hero</h2><label style={labelStyle}><input type="checkbox" name="hero-hidden" defaultChecked={hero.hidden === true} /> Hide this section</label><Field name="hero-heading" label="Heading" value={hero.heading} /><Field name="hero-body" label="Introduction" value={hero.body} multiline /><Field name="hero-scroll" label="Scroll hint" value={hero.scrollLabel} /><Field name="hero-video" label="Hero video URL" value={hero.videoSrc} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><MediaPicker name="hero-poster" label="Poster image" initialUrl={hero.image?.src} /><Field name="hero-poster-alt" label="Poster image alt text" value={hero.image?.alt} /></div><TypeFields prefix="hero" value={hero.typeStyle} legend="Hero type" /></section>
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>About</h2><Field name="about-eyebrow" label="Label" value={about.eyebrow} /><Field name="about-heading" label="Heading" value={about.heading} /><Field name="about-body" label="Introduction" value={about.body} multiline /></section>
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Group metrics</h2>{metrics.items.map((item, index) => <div key={index} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16 }}><Field name={`metric-value-${index}`} label={`Metric ${index + 1} value`} value={item.value} /><Field name={`metric-label-${index}`} label="Label" value={item.label} /></div>)}<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><Field name="metrics-source-label" label="Source label" value={metrics.source?.label} /><Field name="metrics-source-href" label="Source URL" value={metrics.source?.href} /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, alignItems: "end" }}><Field name="metrics-action-label" label="Link label" value={metrics.action?.label} /><Field name="metrics-action-href" label="Link URL" value={metrics.action?.href} /><label style={labelStyle}><input type="checkbox" name="metrics-action-hidden" defaultChecked={metrics.action?.hidden === true} /> Hide link</label></div></section>
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Local businesses</h2><Field name="local-eyebrow" label="Label" value={local.eyebrow} /><Field name="local-heading" label="Heading" value={local.heading} /><Field name="local-body" label="Introduction" value={local.body} multiline />{local.items.map((item, index) => <div key={index} style={sectionStyle}><h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Card {index + 1}</h3><Field name={`local-title-${index}`} label="Title" value={item.title} /><Field name={`local-body-${index}`} label="Description" value={item.body} multiline /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><MediaPicker name={`local-image-${index}`} label="Image" initialUrl={item.image?.src} /><Field name={`local-image-alt-${index}`} label="Image alt text" value={item.image?.alt} /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><Field name={`local-link-label-${index}`} label="Link label" value={item.link?.label} /><Field name={`local-link-${index}`} label="Link URL" value={item.link?.href} /></div></div>)}</section>
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Locations</h2><Field name="locations-eyebrow" label="Label" value={locations.eyebrow} /><Field name="locations-heading" label="Heading" value={locations.heading} /><Field name="locations-body" label="Introduction" value={locations.body} multiline />{locations.locations.map((item, index) => <div key={index} style={sectionStyle}><h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Location {index + 1}</h3><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><Field name={`location-label-${index}`} label="Label" value={item.label} /><Field name={`location-city-${index}`} label="City" value={item.city} /></div><Field name={`location-address-${index}`} label="Address" value={item.address} multiline /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><MediaPicker name={`location-image-${index}`} label="Image" initialUrl={item.image.src} /><Field name={`location-image-alt-${index}`} label="Image alt text" value={item.image.alt} /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><Field name={`location-map-label-${index}`} label="Map link label" value={item.mapLink?.label} /><Field name={`location-map-${index}`} label="Map URL" value={item.mapLink?.href} /></div></div>)}</section>
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Global businesses</h2><Field name="global-eyebrow" label="Label" value={global.eyebrow} /><Field name="global-heading" label="Heading" value={global.heading} /><Field name="global-body" label="Introduction" value={global.body} multiline />{global.items.map((item, index) => <div key={index} style={sectionStyle}><h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Card {index + 1}</h3><Field name={`global-title-${index}`} label="Title" value={item.title} /><Field name={`global-body-${index}`} label="Description" value={item.body} multiline /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><MediaPicker name={`global-image-${index}`} label="Image" initialUrl={item.image?.src} /><Field name={`global-image-alt-${index}`} label="Image alt text" value={item.image?.alt} /></div><Field name={`global-tags-${index}`} label="Tags (comma-separated)" value={item.tags?.join(", ")} /></div>)}</section>
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>News &amp; updates</h2><Field name="news-updates-eyebrow" label="Section label" value={newsUpdates.eyebrow} />{newsUpdates.items.map((item, index) => <div key={index} style={sectionStyle}><h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Card {index + 1}</h3><Field name={`news-title-${index}`} label="Title" value={item.title} /><Field name={`news-body-${index}`} label="Description" value={item.body} multiline /><Field name={`news-link-${index}`} label="Link URL" value={item.link?.href} /><Field name={`news-video-${index}`} label="Video URL (optional)" value={item.videoSrc} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><MediaPicker name={`news-image-${index}`} label={item.videoSrc ? "Video poster image" : "Image"} initialUrl={item.image?.src} /><Field name={`news-image-alt-${index}`} label="Image alt text" value={item.image?.alt} /></div><Field name={`news-tags-${index}`} label="Tags (comma-separated)" value={item.tags?.join(", ")} /></div>)}</section>
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Contact call-to-action</h2><Field name="contact-eyebrow" label="Label" value={contact.eyebrow} /><Field name="contact-heading" label="Heading" value={contact.heading} /><Field name="contact-body" label="Introduction" value={contact.body} multiline /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><Field name="form-name" label="Name label" value={contact.form?.nameLabel} /><Field name="form-email" label="Email label" value={contact.form?.emailLabel} /></div><Field name="form-email-placeholder" label="Email placeholder" value={contact.form?.emailPlaceholder} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><Field name="form-phone" label="Phone label" value={contact.form?.phoneLabel} /><Field name="form-interest" label="Interest label" value={contact.form?.interestLabel} /></div><Field name="form-interests" label="Interest options (one per line)" value={contact.form?.interests?.join("\n")} multiline /><Field name="form-message" label="Message label" value={contact.form?.messageLabel} /><Field name="form-submit" label="Submit label" value={contact.form?.submitLabel} /><Field name="form-consent" label="Consent text" value={contact.form?.consent} multiline /><Field name="form-success" label="Success message" value={contact.form?.successMessage} multiline /><Field name="form-error" label="Error message" value={contact.form?.errorMessage} /><Field name="form-recipient" label="Recipient email" value={contact.form?.recipientEmail} /><Field name="form-subject" label="Email subject" value={contact.form?.emailSubject} /><label style={labelStyle}>Delivery<select name="form-delivery" defaultValue={contact.form?.delivery ?? "both"}><option value="both">Save in the inbox and email the recipient</option><option value="inbox">Save in the inbox only</option><option value="email">Email the recipient only</option></select></label><label style={{ ...labelStyle, marginTop: 10 }}><input type="checkbox" name="form-hidden" defaultChecked={contact.form?.hidden === true} /> Hide this form</label><TypeFields prefix="contact" value={contact.typeStyle} legend="Enquiry type" /></section>
    <div style={{ display: "flex", gap: 10, marginTop: 26 }}><button className="btn btn-dark" type="submit" disabled={saving}>{saving ? "Saving…" : "Save Home page"}</button><a href="/preview/home" target="_blank" className="btn">Preview draft</a></div>{error && <p className="error-msg">{error}</p>}{notice && <p className="success-msg" aria-live="polite">{notice}</p>}
  </form>;
}

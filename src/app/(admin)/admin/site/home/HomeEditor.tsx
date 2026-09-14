"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentModule, ModuleDocument } from "@/lib/content-modules";
import MediaPicker from "@/components/admin/MediaPicker";

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
  const hero = getModule(content, "hero", "hero");
  const about = getModule(content, "about", "rich-text");
  const metrics = getModule(content, "group-metrics", "metrics");
  const local = getModule(content, "local-businesses", "feature-grid");
  const locations = getModule(content, "locations", "location-grid");
  const global = getModule(content, "global-businesses", "feature-grid");
  const contact = getModule(content, "contact", "call-to-action");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const next = structuredClone(content);
    const nextHero = getModule(next, "hero", "hero");
    nextHero.heading = value("hero-heading"); nextHero.body = value("hero-body"); nextHero.videoSrc = value("hero-video") || undefined;
    nextHero.image = { src: value("hero-poster"), alt: value("hero-poster-alt") };
    getModule(next, "about", "rich-text").body = value("about-body");
    getModule(next, "group-metrics", "metrics").items = metrics.items.map((item, index) => ({ ...item, value: value(`metric-value-${index}`), label: value(`metric-label-${index}`) }));
    const nextLocal = getModule(next, "local-businesses", "feature-grid");
    nextLocal.heading = value("local-heading"); nextLocal.body = value("local-body"); nextLocal.items = local.items.map((item, index) => ({ ...item, title: value(`local-title-${index}`), body: value(`local-body-${index}`), image: { src: value(`local-image-${index}`), alt: value(`local-image-alt-${index}`) }, link: { label: value(`local-link-label-${index}`), href: value(`local-link-${index}`) } }));
    const nextLocations = getModule(next, "locations", "location-grid");
    nextLocations.heading = value("locations-heading"); nextLocations.body = value("locations-body"); nextLocations.locations = locations.locations.map((item, index) => ({ ...item, label: value(`location-label-${index}`), city: value(`location-city-${index}`), address: value(`location-address-${index}`), image: { src: value(`location-image-${index}`), alt: value(`location-image-alt-${index}`) }, mapLink: { label: "View on map", href: value(`location-map-${index}`), external: true } }));
    const nextGlobal = getModule(next, "global-businesses", "feature-grid");
    nextGlobal.heading = value("global-heading"); nextGlobal.items = global.items.map((item, index) => ({ ...item, title: value(`global-title-${index}`), body: value(`global-body-${index}`), image: { src: value(`global-image-${index}`), alt: value(`global-image-alt-${index}`) }, tags: value(`global-tags-${index}`).split(",").map((tag) => tag.trim()).filter(Boolean) }));
    const nextContact = getModule(next, "contact", "call-to-action");
    nextContact.heading = value("contact-heading"); nextContact.body = value("contact-body");
    const payload = { status: value("status"), seo: { title: value("seo-title"), description: value("seo-description") }, content: next };
    try {
      const response = await fetch("/api/site-pages/home", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Save failed");
      router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Save failed"); }
    finally { setSaving(false); }
  }

  return <form onSubmit={save} className="card" style={{ maxWidth: 960 }}>
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 16 }}><div><label htmlFor="status" style={labelStyle}>Status</label><select id="status" name="status" defaultValue={status}><option value="draft">Draft</option><option value="published">Published</option></select></div><Field name="seo-title" label="SEO title" value={seo.title} /></div>
    <Field name="seo-description" label="SEO description" value={seo.description} multiline />
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Hero</h2><Field name="hero-heading" label="Heading" value={hero.heading} /><Field name="hero-body" label="Introduction" value={hero.body} multiline /><Field name="hero-video" label="Hero video URL" value={hero.videoSrc} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><MediaPicker name="hero-poster" label="Poster image" initialUrl={hero.image?.src} /><Field name="hero-poster-alt" label="Poster image alt text" value={hero.image?.alt} /></div></section>
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>About</h2><Field name="about-body" label="Introduction" value={about.body} multiline /></section>
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Group metrics</h2>{metrics.items.map((item, index) => <div key={index} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16 }}><Field name={`metric-value-${index}`} label={`Metric ${index + 1} value`} value={item.value} /><Field name={`metric-label-${index}`} label="Label" value={item.label} /></div>)}</section>
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Local businesses</h2><Field name="local-heading" label="Heading" value={local.heading} /><Field name="local-body" label="Introduction" value={local.body} multiline />{local.items.map((item, index) => <div key={index} style={sectionStyle}><h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Card {index + 1}</h3><Field name={`local-title-${index}`} label="Title" value={item.title} /><Field name={`local-body-${index}`} label="Description" value={item.body} multiline /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><MediaPicker name={`local-image-${index}`} label="Image" initialUrl={item.image?.src} /><Field name={`local-image-alt-${index}`} label="Image alt text" value={item.image?.alt} /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><Field name={`local-link-label-${index}`} label="Link label" value={item.link?.label} /><Field name={`local-link-${index}`} label="Link URL" value={item.link?.href} /></div></div>)}</section>
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Locations</h2><Field name="locations-heading" label="Heading" value={locations.heading} /><Field name="locations-body" label="Introduction" value={locations.body} multiline />{locations.locations.map((item, index) => <div key={index} style={sectionStyle}><h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Location {index + 1}</h3><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><Field name={`location-label-${index}`} label="Label" value={item.label} /><Field name={`location-city-${index}`} label="City" value={item.city} /></div><Field name={`location-address-${index}`} label="Address" value={item.address} multiline /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><MediaPicker name={`location-image-${index}`} label="Image" initialUrl={item.image.src} /><Field name={`location-image-alt-${index}`} label="Image alt text" value={item.image.alt} /></div><Field name={`location-map-${index}`} label="Map URL" value={item.mapLink?.href} /></div>)}</section>
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Global businesses</h2><Field name="global-heading" label="Heading" value={global.heading} />{global.items.map((item, index) => <div key={index} style={sectionStyle}><h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Card {index + 1}</h3><Field name={`global-title-${index}`} label="Title" value={item.title} /><Field name={`global-body-${index}`} label="Description" value={item.body} multiline /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><MediaPicker name={`global-image-${index}`} label="Image" initialUrl={item.image?.src} /><Field name={`global-image-alt-${index}`} label="Image alt text" value={item.image?.alt} /></div><Field name={`global-tags-${index}`} label="Tags (comma-separated)" value={item.tags?.join(", ")} /></div>)}</section>
    <section style={sectionStyle}><h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Contact call-to-action</h2><Field name="contact-heading" label="Heading" value={contact.heading} /><Field name="contact-body" label="Introduction" value={contact.body} multiline /></section>
    <div style={{ display: "flex", gap: 10, marginTop: 26 }}><button className="btn btn-dark" type="submit" disabled={saving}>{saving ? "Saving…" : "Save Home page"}</button><a href="/" target="_blank" className="btn">Preview site</a></div>{error && <p className="error-msg">{error}</p>}
  </form>;
}

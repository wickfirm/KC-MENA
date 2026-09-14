"use client";

import { FormEvent, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import type { LocalBusinessContent } from "@/lib/local-business-content";

type Props = { content: LocalBusinessContent; status: "draft" | "published"; seo: { title?: string; description?: string } };
const control = { width: "100%", padding: "9px 10px", border: "1px solid var(--line)", marginTop: 5 };

function Field({ label, name, defaultValue, multiline = false }: { label: string; name: string; defaultValue: string; multiline?: boolean }) {
  return <label style={{ display: "block", marginBottom: 14, fontSize: ".82rem", fontWeight: 700 }}>{label}
    {multiline ? <textarea name={name} defaultValue={defaultValue} rows={4} style={control} /> : <input name={name} defaultValue={defaultValue} style={control} />}
  </label>;
}

export default function LocalBusinessEditor({ content, status, seo }: Props) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const next: LocalBusinessContent = { version: 1, hero: { title: value("heroTitle"), image: value("heroImage") }, intro: { heading: value("introHeading"), metrics: content.intro.metrics.map((metric, index) => ({ value: value(`metric-${index}-value`), label: value(`metric-${index}-label`) })) }, panels: content.panels.map((panel, index) => ({ eyebrow: value(`panel-${index}-eyebrow`), heading: value(`panel-${index}-heading`), body: value(`panel-${index}-body`), href: panel.href, image: value(`panel-${index}-image`) || panel.image })) };
    const response = await fetch("/api/site-pages/local-business", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: value("status"), seo: { title: value("seoTitle"), description: value("seoDescription") }, content: next }) });
    const result = await response.json().catch(() => ({}));
    setSaving(false); setMessage(response.ok ? "Saved. Publish when the page is ready for the public site." : result.error || "Could not save changes.");
  }
  return <form onSubmit={save} className="card" style={{ maxWidth: 900 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 20 }}><label style={{ fontWeight: 700 }}>Status <select name="status" defaultValue={status} style={{ marginLeft: 8, padding: 7 }}><option value="draft">Draft</option><option value="published">Published</option></select></label><a className="btn" href="/preview/local-business" target="_blank">Preview draft</a></div>
    <h2 style={{ fontSize: "1.15rem", marginBottom: 14 }}>Hero and introduction</h2><Field label="Page title" name="heroTitle" defaultValue={content.hero.title} /><MediaPicker name="heroImage" label="Hero image" initialUrl={content.hero.image} /><Field label="Introduction heading" name="introHeading" defaultValue={content.intro.heading} multiline />
    <section style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 20 }}><h2 style={{ fontSize: "1.05rem", marginBottom: 14 }}>Key metrics</h2>{content.intro.metrics.map((metric, index) => <div key={index} style={{ display: "grid", gridTemplateColumns: "minmax(120px, .35fr) 1fr", gap: 12 }}><Field label="Value" name={`metric-${index}-value`} defaultValue={metric.value} /><Field label="Label" name={`metric-${index}-label`} defaultValue={metric.label} /></div>)}</section>
    {content.panels.map((panel, index) => <section key={index} style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 20 }}><h2 style={{ fontSize: "1.05rem", marginBottom: 14 }}>Business line {index + 1}</h2><Field label="Label" name={`panel-${index}-eyebrow`} defaultValue={panel.eyebrow} /><Field label="Heading" name={`panel-${index}-heading`} defaultValue={panel.heading} multiline /><Field label="Body" name={`panel-${index}-body`} defaultValue={panel.body} multiline /><p style={{ fontSize: ".8rem", color: "var(--grey-5)" }}>Destination: {panel.href}</p><MediaPicker name={`panel-${index}-image`} label="Image" initialUrl={panel.image} /></section>)}
    <section style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 20 }}><h2 style={{ fontSize: "1.05rem", marginBottom: 14 }}>Search appearance</h2><Field label="SEO title" name="seoTitle" defaultValue={seo.title ?? ""} /><Field label="SEO description" name="seoDescription" defaultValue={seo.description ?? ""} multiline /></section>
    {message && <p className={message.startsWith("Saved") ? "success-msg" : "error-msg"}>{message}</p>}<button className="btn btn-dark" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
  </form>;
}

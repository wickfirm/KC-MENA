"use client";

import { FormEvent, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import type { BusinessDetailContent, BusinessDetailSlug } from "@/lib/business-detail-content";

type Props = {
  slug: BusinessDetailSlug;
  content: BusinessDetailContent;
  status: "draft" | "published";
  seo: { title?: string; description?: string };
};

const inputStyle = { width: "100%", padding: "9px 10px", border: "1px solid var(--line)", marginTop: 5 };

function Field({ label, name, defaultValue, multiline = false }: { label: string; name: string; defaultValue: string; multiline?: boolean }) {
  return <label style={{ display: "block", marginBottom: 14, fontSize: ".82rem", fontWeight: 700 }}>
    {label}
    {multiline ? <textarea name={name} defaultValue={defaultValue} rows={4} style={inputStyle} /> : <input name={name} defaultValue={defaultValue} style={inputStyle} />}
  </label>;
}

export default function BusinessDetailEditor({ slug, content, status, seo }: Props) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const next: BusinessDetailContent = {
      version: 1,
      hero: { title: value("heroTitle"), image: value("heroImage") },
      overview: { eyebrow: value("overviewEyebrow"), heading: value("overviewHeading") },
      metrics: content.metrics?.map((metric, index) => ({ value: value(`metric-${index}-value`), label: value(`metric-${index}-label`) })),
      metricsSource: content.metricsSource ? { label: value("metrics-source-label"), href: value("metrics-source-href") } : undefined,
      callouts: content.callouts?.map((callout, index) => ({ eyebrow: value(`callout-${index}-eyebrow`), heading: value(`callout-${index}-heading`), body: value(`callout-${index}-body`), href: value(`callout-${index}-href`), label: value(`callout-${index}-label`) })),
      sections: content.sections.map((section, index) => ({
        eyebrow: value(`section-${index}-eyebrow`),
        heading: value(`section-${index}-heading`),
        body: value(`section-${index}-body`),
        image: value(`section-${index}-image`) || section.image,
        action: section.action ? { label: value(`section-${index}-action-label`), href: value(`section-${index}-action-href`), external: section.action.external } : undefined,
      })),
    };
    const response = await fetch(`/api/site-pages/business/${slug}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value("status"), seo: { title: value("seoTitle"), description: value("seoDescription") }, content: next }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(response.ok ? "Saved. Publish when the page is ready for the public site." : data.error || "Could not save changes.");
  }

  return <form onSubmit={save} className="card" style={{ maxWidth: 900 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 20 }}>
      <label style={{ fontWeight: 700 }}>Status <select name="status" defaultValue={status} style={{ marginLeft: 8, padding: 7 }}><option value="draft">Draft</option><option value="published">Published</option></select></label>
      <a className="btn" href={`/preview/business/${slug}`} target="_blank">Preview draft</a>
    </div>
    <h2 style={{ fontSize: "1.15rem", marginBottom: 14 }}>Hero and introduction</h2>
    <Field label="Page title" name="heroTitle" defaultValue={content.hero.title} />
    <MediaPicker name="heroImage" label="Hero image" initialUrl={content.hero.image} />
    <Field label="Introduction label" name="overviewEyebrow" defaultValue={content.overview.eyebrow} />
    <Field label="Introduction heading" name="overviewHeading" defaultValue={content.overview.heading} multiline />
    {content.metrics && <section style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 20 }}><h2 style={{ fontSize: "1.05rem", marginBottom: 14 }}>Key metrics</h2>{content.metrics.map((metric, index) => <div key={index} style={{ display: "grid", gridTemplateColumns: "minmax(120px, .35fr) 1fr", gap: 12 }}><Field label="Value" name={`metric-${index}-value`} defaultValue={metric.value} /><Field label="Label" name={`metric-${index}-label`} defaultValue={metric.label} /></div>)}</section>}
    {content.metricsSource && <section style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 20 }}><Field label="Metrics source label" name="metrics-source-label" defaultValue={content.metricsSource.label} /><Field label="Metrics source URL" name="metrics-source-href" defaultValue={content.metricsSource.href} /></section>}
    {content.callouts?.map((callout, index) => <section key={callout.heading} style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 20 }}><h2 style={{ fontSize: "1.05rem", marginBottom: 14 }}>Callout {index + 1}</h2><Field label="Label" name={`callout-${index}-eyebrow`} defaultValue={callout.eyebrow} /><Field label="Heading" name={`callout-${index}-heading`} defaultValue={callout.heading} /><Field label="Body" name={`callout-${index}-body`} defaultValue={callout.body} multiline /><Field label="Link URL" name={`callout-${index}-href`} defaultValue={callout.href} /><Field label="Link label" name={`callout-${index}-label`} defaultValue={callout.label} /></section>)}
    {content.sections.map((section, index) => <section key={index} style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 20 }}>
      <h2 style={{ fontSize: "1.05rem", marginBottom: 14 }}>Content section {index + 1}</h2>
      <Field label="Label" name={`section-${index}-eyebrow`} defaultValue={section.eyebrow} />
      <Field label="Heading" name={`section-${index}-heading`} defaultValue={section.heading} multiline />
      <Field label="Body" name={`section-${index}-body`} defaultValue={section.body} multiline />
      <MediaPicker name={`section-${index}-image`} label="Image" initialUrl={section.image} />
      {section.action && <><Field label="CTA label" name={`section-${index}-action-label`} defaultValue={section.action.label} /><Field label="CTA URL" name={`section-${index}-action-href`} defaultValue={section.action.href} /></>}
    </section>)}
    <section style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 20 }}>
      <h2 style={{ fontSize: "1.05rem", marginBottom: 14 }}>Search appearance</h2>
      <Field label="SEO title" name="seoTitle" defaultValue={seo.title ?? ""} />
      <Field label="SEO description" name="seoDescription" defaultValue={seo.description ?? ""} multiline />
    </section>
    {message && <p className={message.startsWith("Saved") ? "success-msg" : "error-msg"}>{message}</p>}
    <button className="btn btn-dark" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
  </form>;
}

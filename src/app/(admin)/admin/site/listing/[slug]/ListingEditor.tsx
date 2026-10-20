"use client";

import { FormEvent, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import { labelStyle, sectionHeading, sectionStyle } from "@/components/admin/editor-styles";
import type { InsightCard, ListingContent, ListingSlug } from "@/lib/listing-content";

type Props = {
  slug: ListingSlug;
  content: ListingContent;
  status: "draft" | "published";
  seo: { title?: string; description?: string };
};

function Field({ label, name, defaultValue, multiline = false, rows = 4 }: { label: string; name: string; defaultValue: string; multiline?: boolean; rows?: number }) {
  return <div style={{ marginBottom: 14 }}><label htmlFor={name} style={labelStyle}>{label}</label>{multiline ? <textarea id={name} name={name} defaultValue={defaultValue} rows={rows} /> : <input id={name} name={name} defaultValue={defaultValue} />}</div>;
}

export default function ListingEditor({ slug, content, status, seo }: Props) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const isNews = slug === "news";

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const cards: InsightCard[] = (content.insightCards ?? []).map((card, index) => ({
      tag: value(`card-${index}-tag`),
      href: value(`card-${index}-href`),
      image: value(`card-${index}-image`) || card.image,
    })).filter((card) => card.tag && card.href);
    const next: ListingContent = {
      version: 1,
      hero: { title: value("heroTitle"), image: value("heroImage") },
      eyebrow: value("eyebrow") || undefined,
      heading: value("heading"),
      intro: value("intro"),
      emptyMessage: value("emptyMessage"),
      careerForm: slug === "careers" ? {
        eyebrow: value("career-form-eyebrow"), heading: value("career-form-heading"), body: value("career-form-body"),
        offices: (content.careerForm?.offices ?? []).map((office, index) => ({ title: value(`career-office-${index}-title`), address: value(`career-office-${index}-address`) })),
        consent: value("career-consent"), submitLabel: value("career-submit-label"),
      } : undefined,
      featuredVideo: isNews ? { heading: value("videoHeading"), body: value("videoBody") } : undefined,
      insightCards: isNews && cards.length ? cards : undefined,
      disclaimer: isNews ? value("disclaimer") || undefined : undefined,
    };
    const response = await fetch(`/api/site-pages/listing/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value("status"), seo: { title: value("seoTitle"), description: value("seoDescription") }, content: next }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(
      response.ok
        ? String(form.get("status")) === "published"
          ? "Saved and published — the change is live on the public site."
          : "Saved as a DRAFT — the public page is unchanged. Set Status to Published and save again to go live."
        : data.error || "Could not save changes."
    );
  }

  return <form onSubmit={save} className="card" style={{ maxWidth: 900 }}>
    <div style={{ width: 160 }}><label htmlFor="status" style={labelStyle}>Status</label><select id="status" name="status" defaultValue={status}><option value="draft">Draft</option><option value="published">Published</option></select></div>
    <section style={sectionStyle}>
      <h2 style={sectionHeading}>Hero and introduction</h2>
      <Field label="Page title" name="heroTitle" defaultValue={content.hero.title} />
      <MediaPicker name="heroImage" label="Hero image" initialUrl={content.hero.image} />
      {content.eyebrow !== undefined && <Field label="Label above heading" name="eyebrow" defaultValue={content.eyebrow} />}
      <Field label="Heading" name="heading" defaultValue={content.heading} />
      <Field label="Introduction" name="intro" defaultValue={content.intro} multiline />
      <Field label="Empty-state message" name="emptyMessage" defaultValue={content.emptyMessage ?? ""} multiline rows={3} />
    </section>
    {slug === "careers" && content.careerForm && <section style={sectionStyle}><h2 style={sectionHeading}>Application form band</h2><Field label="Section label" name="career-form-eyebrow" defaultValue={content.careerForm.eyebrow} /><Field label="Heading" name="career-form-heading" defaultValue={content.careerForm.heading} /><Field label="Introduction" name="career-form-body" defaultValue={content.careerForm.body} multiline />{content.careerForm.offices.map((office, index) => <div key={index} style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 14 }}><Field label={`Office ${index + 1} title`} name={`career-office-${index}-title`} defaultValue={office.title} /><Field label={`Office ${index + 1} address`} name={`career-office-${index}-address`} defaultValue={office.address} multiline /></div>)}<Field label="Consent text" name="career-consent" defaultValue={content.careerForm.consent} multiline /><Field label="Submit label" name="career-submit-label" defaultValue={content.careerForm.submitLabel} /></section>}
    {isNews && <section style={sectionStyle}>
      <h2 style={sectionHeading}>Featured video band</h2>
      <Field label="Heading" name="videoHeading" defaultValue={content.featuredVideo?.heading ?? ""} />
      <Field label="Body" name="videoBody" defaultValue={content.featuredVideo?.body ?? ""} multiline />
    </section>}
    {isNews && <section style={sectionStyle}>
      <h2 style={sectionHeading}>External insight cards</h2>
      {(content.insightCards ?? []).map((card, index) => <section key={index} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 16, marginBottom: 16 }}>
        <Field label={`Card ${index + 1} label`} name={`card-${index}-tag`} defaultValue={card.tag} />
        <Field label={`Card ${index + 1} URL`} name={`card-${index}-href`} defaultValue={card.href} />
        <MediaPicker name={`card-${index}-image`} label={`Card ${index + 1} image`} initialUrl={card.image ?? ""} />
      </section>)}
      <p style={{ color: "var(--grey-5)", fontSize: ".8rem" }}>Clear a label to remove that card.</p>
    </section>}
    {isNews && <section style={sectionStyle}>
      <h2 style={sectionHeading}>Disclaimer</h2>
      <Field label="Disclaimer text" name="disclaimer" defaultValue={content.disclaimer ?? ""} multiline rows={8} />
    </section>}
    <section style={sectionStyle}>
      <h2 style={sectionHeading}>Search appearance</h2>
      <Field label="SEO title" name="seoTitle" defaultValue={seo.title ?? ""} />
      <Field label="SEO description" name="seoDescription" defaultValue={seo.description ?? ""} multiline />
    </section>
    <div style={{ display: "flex", gap: 10, marginTop: 26 }}><button className="btn btn-dark" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button><a className="btn" href={`/preview/listing/${slug}`} target="_blank">Preview draft</a></div>
    {message && <p className={message.startsWith("Saved") ? "success-msg" : "error-msg"}>{message}</p>}
  </form>;
}

"use client";

import { FormEvent, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import { labelStyle, sectionHeading, sectionStyle, subHeading } from "@/components/admin/editor-styles";
import TypeFields, { readTypeScale } from "@/components/admin/TypeFields";
import type { BusinessDetailContent, BusinessDetailSlug } from "@/lib/business-detail-content";

type Props = {
  slug: BusinessDetailSlug;
  content: BusinessDetailContent;
  status: "draft" | "published";
  seo: { title?: string; description?: string };
};

function Field({ label, name, defaultValue, multiline = false }: { label: string; name: string; defaultValue: string; multiline?: boolean }) {
  return <div style={{ marginBottom: 14 }}><label htmlFor={name} style={labelStyle}>{label}</label>{multiline ? <textarea id={name} name={name} defaultValue={defaultValue} rows={4} /> : <input id={name} name={name} defaultValue={defaultValue} />}</div>;
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
      type: readTypeScale(value, "page"),
      hero: { title: value("heroTitle"), image: value("heroImage") },
      overview: { eyebrow: value("overviewEyebrow"), heading: value("overviewHeading"), body: value("overviewBody") || undefined },
      platformMetrics: content.platformMetrics ? {
        primary: content.platformMetrics.primary.map((metric, index) => ({ value: value(`platform-primary-${index}-value`), label: value(`platform-primary-${index}-label`) })),
        sectors: content.platformMetrics.sectors.map((metric, index) => ({ value: value(`platform-sector-${index}-value`), label: value(`platform-sector-${index}-label`), detail: value(`platform-sector-${index}-detail`) })),
        source: { label: value("platform-source-label"), href: value("platform-source-href") },
      } : undefined,
      metrics: content.metrics?.map((metric, index) => ({ value: value(`metric-${index}-value`), label: value(`metric-${index}-label`) })),
      metricsSource: content.metricsSource ? { label: value("metrics-source-label"), href: value("metrics-source-href") } : undefined,
      contact: content.contact ? {
        eyebrow: value("contact-eyebrow"), heading: value("contact-heading"), officeLabel: value("contact-office-label"), officeLines: value("contact-office-lines").split(/\r?\n/).map((line) => line.trim()).filter(Boolean), mapUrl: value("contact-map-url"), mapLabel: value("contact-map-label"), contactLabel: value("contact-label"), body: value("contact-body"), phone: value("contact-phone"), email: value("contact-email"), subjectLabel: value("contact-subject-label"), subjectPlaceholder: value("contact-subject-placeholder"), submitLabel: value("contact-submit-label"), successMessage: value("contact-success-message"), recipientEmail: value("contact-recipient"), emailSubject: value("contact-email-subject"), delivery: (value("contact-delivery") || "both") as "inbox" | "email" | "both", errorMessage: value("contact-error"), hidden: form.get("contact-hidden") === "on", nameLabel: value("contact-name-label"), emailLabel: value("contact-email-label"), phoneLabel: value("contact-phone-label"), messageLabel: value("contact-message-label"),
      } : undefined,
      bizBand: content.bizBand ? { eyebrow: value("biz-band-eyebrow"), heading: value("biz-band-heading"), body: value("biz-band-body") } : undefined,
      locations: content.locations?.map((location, index) => ({ country: value(`location-${index}-country`), city: value(`location-${index}-city`), line: value(`location-${index}-line`), image: value(`location-${index}-image`) || location.image, mapUrl: value(`location-${index}-map-url`), mapLabel: value(`location-${index}-map-label`) })),
      callouts: content.callouts?.map((callout, index) => ({ eyebrow: value(`callout-${index}-eyebrow`), heading: value(`callout-${index}-heading`), body: value(`callout-${index}-body`), href: value(`callout-${index}-href`), label: value(`callout-${index}-label`), variant: callout.variant })),
      projectsHeading: value("projectsHeading") || undefined,
      projectsEyebrow: value("projectsEyebrow") || undefined,
      sections: content.sections.map((section, index) => ({
        eyebrow: value(`section-${index}-eyebrow`),
        heading: value(`section-${index}-heading`),
        body: value(`section-${index}-body`),
        image: value(`section-${index}-image`) || section.image,
        action: section.action ? { label: value(`section-${index}-action-label`), href: value(`section-${index}-action-href`), external: section.action.external, hidden: form.get(`section-${index}-action-hidden`) === "on" } : undefined,
        hidden: form.get(`section-${index}-hidden`) === "on",
        typeStyle: readTypeScale(value, `section-${index}`),
      })),
    };
    const response = await fetch(`/api/site-pages/business/${slug}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
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
      <TypeFields prefix="page" value={content.type} legend="This page — overrides the site-wide type" />
      <h2 style={sectionHeading}>Hero and introduction</h2>
      <Field label="Page title" name="heroTitle" defaultValue={content.hero.title} />
      <MediaPicker name="heroImage" label="Hero image" initialUrl={content.hero.image} />
      <Field label="Introduction label" name="overviewEyebrow" defaultValue={content.overview.eyebrow} />
      <Field label="Introduction heading" name="overviewHeading" defaultValue={content.overview.heading} multiline />
      <Field label="Introduction body" name="overviewBody" defaultValue={content.overview.body ?? ""} multiline />
    </section>
    {content.platformMetrics && <section style={sectionStyle}>
      <h2 style={sectionHeading}>Global platform metrics</h2>
      <h3 style={subHeading}>Headline metrics</h3>
      {content.platformMetrics.primary.map((metric, index) => <div key={index} style={{ display: "grid", gridTemplateColumns: "minmax(120px, .35fr) 1fr", gap: 12 }}><Field label="Value" name={`platform-primary-${index}-value`} defaultValue={metric.value} /><Field label="Label" name={`platform-primary-${index}-label`} defaultValue={metric.label} /></div>)}
      <h3 style={{ ...subHeading, marginTop: 16 }}>Sector breakdown</h3>
      {content.platformMetrics.sectors.map((metric, index) => <div key={index} style={{ display: "grid", gridTemplateColumns: "minmax(120px, .35fr) 1fr 1fr", gap: 12 }}><Field label="Value" name={`platform-sector-${index}-value`} defaultValue={metric.value} /><Field label="Sector" name={`platform-sector-${index}-label`} defaultValue={metric.label} /><Field label="Detail" name={`platform-sector-${index}-detail`} defaultValue={metric.detail} /></div>)}
      <Field label="Source label" name="platform-source-label" defaultValue={content.platformMetrics.source.label} /><Field label="Source URL" name="platform-source-href" defaultValue={content.platformMetrics.source.href} />
    </section>}
    {content.metrics && <section style={sectionStyle}><h2 style={sectionHeading}>Key metrics</h2>{content.metrics.map((metric, index) => <div key={index} style={{ display: "grid", gridTemplateColumns: "minmax(120px, .35fr) 1fr", gap: 12 }}><Field label="Value" name={`metric-${index}-value`} defaultValue={metric.value} /><Field label="Label" name={`metric-${index}-label`} defaultValue={metric.label} /></div>)}</section>}
    {content.metricsSource && <section style={sectionStyle}><Field label="Metrics source label" name="metrics-source-label" defaultValue={content.metricsSource.label} /><Field label="Metrics source URL" name="metrics-source-href" defaultValue={content.metricsSource.href} /></section>}
    {content.bizBand && <section style={sectionStyle}><h2 style={sectionHeading}>Business platform band</h2><Field label="Label" name="biz-band-eyebrow" defaultValue={content.bizBand.eyebrow} /><Field label="Heading" name="biz-band-heading" defaultValue={content.bizBand.heading} /><Field label="Body" name="biz-band-body" defaultValue={content.bizBand.body} multiline /></section>}
    {content.callouts?.map((callout, index) => <section key={callout.heading} style={sectionStyle}><h2 style={sectionHeading}>Callout {index + 1}</h2><Field label="Label" name={`callout-${index}-eyebrow`} defaultValue={callout.eyebrow} /><Field label="Heading" name={`callout-${index}-heading`} defaultValue={callout.heading} /><Field label="Body" name={`callout-${index}-body`} defaultValue={callout.body} multiline /><Field label="Link URL" name={`callout-${index}-href`} defaultValue={callout.href} /><Field label="Link label" name={`callout-${index}-label`} defaultValue={callout.label} /></section>)}
    {content.locations && <section style={sectionStyle}><h2 style={sectionHeading}>Map locations</h2>{content.locations.map((location, index) => <div key={index} style={{ borderTop: index ? "1px solid var(--line)" : undefined, paddingTop: index ? 16 : 0, marginTop: index ? 16 : 0 }}><Field label="Country" name={`location-${index}-country`} defaultValue={location.country} /><Field label="City" name={`location-${index}-city`} defaultValue={location.city} /><Field label="Address line" name={`location-${index}-line`} defaultValue={location.line} /><MediaPicker name={`location-${index}-image`} label="Image" initialUrl={location.image} /><Field label="Map link label" name={`location-${index}-map-label`} defaultValue={location.mapLabel ?? "View on map ↗"} /><Field label="Map URL" name={`location-${index}-map-url`} defaultValue={location.mapUrl} /></div>)}</section>}
    <section style={sectionStyle}>
      <h2 style={sectionHeading}>Projects band</h2>
      <p style={{ color: "var(--grey-5)", fontSize: ".82rem", marginBottom: 14 }}>
        Published projects assigned to this sector (Projects in the sidebar) appear in a band above the footer.
        Leave the heading empty to use the default wording.
      </p>
      <Field label="Projects label" name="projectsEyebrow" defaultValue={content.projectsEyebrow ?? ""} />
      <Field label="Projects heading" name="projectsHeading" defaultValue={content.projectsHeading ?? ""} />
    </section>
    {content.sections.map((section, index) => <section key={index} style={sectionStyle}>
      <h2 style={sectionHeading}>Content section {index + 1}</h2>
      <Field label="Label" name={`section-${index}-eyebrow`} defaultValue={section.eyebrow} />
      <Field label="Heading" name={`section-${index}-heading`} defaultValue={section.heading} multiline />
      <Field label="Body" name={`section-${index}-body`} defaultValue={section.body} multiline />
      <MediaPicker name={`section-${index}-image`} label="Image" initialUrl={section.image} />
      <label style={labelStyle}><input type="checkbox" name={`section-${index}-hidden`} defaultChecked={section.hidden === true} /> Hide section</label><TypeFields prefix={`section-${index}`} value={section.typeStyle} legend="This section — overrides the page" />{section.action && <><Field label="CTA label" name={`section-${index}-action-label`} defaultValue={section.action.label} /><Field label="CTA URL" name={`section-${index}-action-href`} defaultValue={section.action.href} /><label style={labelStyle}><input type="checkbox" name={`section-${index}-action-hidden`} defaultChecked={section.action.hidden === true} /> Hide button</label></>}
    </section>)}
    <section style={sectionStyle}>
      <h2 style={sectionHeading}>Search appearance</h2>
      <Field label="SEO title" name="seoTitle" defaultValue={seo.title ?? ""} />
      <Field label="SEO description" name="seoDescription" defaultValue={seo.description ?? ""} multiline />
    </section>
    {content.contact && <section style={sectionStyle}><h2 style={sectionHeading}>Contact section</h2><Field label="Section label" name="contact-eyebrow" defaultValue={content.contact.eyebrow} /><Field label="Heading" name="contact-heading" defaultValue={content.contact.heading} /><Field label="Office label" name="contact-office-label" defaultValue={content.contact.officeLabel} /><Field label="Office address (one line per row)" name="contact-office-lines" defaultValue={content.contact.officeLines.join("\n")} multiline /><Field label="Map URL" name="contact-map-url" defaultValue={content.contact.mapUrl} /><Field label="Map link label" name="contact-map-label" defaultValue={content.contact.mapLabel} /><Field label="Contact label" name="contact-label" defaultValue={content.contact.contactLabel} /><Field label="Contact copy" name="contact-body" defaultValue={content.contact.body} multiline /><Field label="Phone" name="contact-phone" defaultValue={content.contact.phone} /><Field label="Email" name="contact-email" defaultValue={content.contact.email} /><Field label="Enquiry type label" name="contact-subject-label" defaultValue={content.contact.subjectLabel} /><Field label="Enquiry type placeholder" name="contact-subject-placeholder" defaultValue={content.contact.subjectPlaceholder} /><Field label="Submit label" name="contact-submit-label" defaultValue={content.contact.submitLabel} /><Field label="Success message" name="contact-success-message" defaultValue={content.contact.successMessage} multiline /><Field label="Recipient email" name="contact-recipient" defaultValue={content.contact.recipientEmail ?? ""} /><Field label="Email subject" name="contact-email-subject" defaultValue={content.contact.emailSubject ?? ""} /><label style={labelStyle}>Delivery<select name="contact-delivery" defaultValue={content.contact.delivery ?? "both"}><option value="both">Save and email</option><option value="inbox">Inbox only</option><option value="email">Email only</option></select></label><label style={labelStyle}><input type="checkbox" name="contact-hidden" defaultChecked={content.contact.hidden === true} /> Hide contact section</label><Field label="Name label" name="contact-name-label" defaultValue={content.contact.nameLabel ?? "Full Name"} /><Field label="Email label" name="contact-email-label" defaultValue={content.contact.emailLabel ?? "Email"} /><Field label="Phone label" name="contact-phone-label" defaultValue={content.contact.phoneLabel ?? "Phone"} /><Field label="Message label" name="contact-message-label" defaultValue={content.contact.messageLabel ?? "Message"} /></section>}
    <div style={{ display: "flex", gap: 10, marginTop: 26 }}><button className="btn btn-dark" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button><a className="btn" href={`/preview/business/${slug}`} target="_blank">Preview draft</a></div>
    {message && <p className={message.startsWith("Saved") ? "success-msg" : "error-msg"}>{message}</p>}
  </form>;
}

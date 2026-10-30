"use client";

import { FormEvent, useState } from "react";
import type { FooterLink, NavItem, SiteSettings } from "@/lib/settings";
import TypeFields, { readTypeScale } from "@/components/admin/TypeFields";
import { labelStyle, sectionHeading, sectionStyle } from "@/components/admin/editor-styles";

function Field({ label, name, defaultValue, multiline = false }: { label: string; name: string; defaultValue: string; multiline?: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={name} style={labelStyle}>{label}</label>
      {multiline ? <textarea id={name} name={name} defaultValue={defaultValue} rows={3} /> : <input id={name} name={name} defaultValue={defaultValue} />}
    </div>
  );
}

function LinesField({ label, name, lines }: { label: string; name: string; lines: string[] }) {
  return <Field label={`${label} (one line per row)`} name={name} defaultValue={lines.join("\n")} multiline />;
}

export default function SettingsEditor({ settings }: { settings: SiteSettings }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const splitLines = (name: string) => String(form.get(name) ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const nav: NavItem[] = settings.nav.map((item, index) => ({ label: value(`nav-${index}-label`), href: value(`nav-${index}-href`) })).filter((item) => item.label && item.href);
    const parseLinks = (name: string): FooterLink[] => String(form.get(name) ?? "").split(/\r?\n/).map((line) => {
      const [label, ...rest] = line.split("|");
      return { label: (label ?? "").trim(), href: rest.join("|").trim() };
    }).filter((item) => item.label && item.href);
    const next = {
      contact: { phone: value("contactPhone"), email: value("contactEmail") },
      address: { lines: splitLines("addressLines") },
      brand: { footerCopy: value("footerCopy") },
      links: { linkedin: value("linkedinUrl"), corporate: value("corporateUrl") },
      nav,
      chrome: { contactLabel: value("contactLabel"), logoAlt: value("logoAlt") },
      footerColumns: settings.footerColumns.map((column, index) => ({ heading: value(`column-${index}-heading`), links: parseLinks(`column-${index}-links`) })),
      copyright: value("copyright"),
      bottomLinks: parseLinks("bottomLinks"),
      drawerCopy: {
        eyebrow: value("drawerEyebrow"), heading: value("drawerHeading"), body: value("drawerBody"), directionsLabel: value("drawerDirections"),
        nameLabel: value("drawerName"), emailLabel: value("drawerEmail"), messageLabel: value("drawerMessage"), submitLabel: value("drawerSubmit"),
        successMessage: value("drawerSuccess"), directPrompt: value("drawerDirect"),
      },
      type: readTypeScale(value, "site-type"),
      newsletter: {
        hidden: form.get("news-hidden") === "on",
        eyebrow: value("news-eyebrow"),
        heading: value("news-heading"),
        body: value("news-body"),
        emailLabel: value("news-email-label"),
        placeholder: value("news-placeholder"),
        submitLabel: value("news-submit"),
        consent: value("news-consent"),
        successMessage: value("news-success"),
        errorMessage: value("news-error"),
        recipientEmail: value("news-recipient"),
        emailSubject: value("news-subject"),
        delivery: (value("news-delivery") || "both") as "inbox" | "email" | "both",
      },
      cookie: {
        title: value("cookieTitle"), body: value("cookieBody"), policyLabel: value("cookiePolicyLabel"), policyHref: value("cookiePolicyHref"),
        manageLabel: value("cookieManage"), necessaryLabel: value("cookieNecessary"), acceptLabel: value("cookieAccept"), saveLabel: value("cookieSave"),
        essentialTitle: value("cookieEssentialTitle"), essentialBody: value("cookieEssentialBody"), analyticsTitle: value("cookieAnalyticsTitle"), analyticsBody: value("cookieAnalyticsBody"),
        mediaTitle: value("cookieMediaTitle"), mediaBody: value("cookieMediaBody"),
      },
      drawer: {
        locations: settings.drawer.locations.map((loc, index) => ({
          title: value(`loc-${index}-title`),
          lines: splitLines(`loc-${index}-lines`),
          mapUrl: value(`loc-${index}-map`),
        })),
      },
    };
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: next }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(response.ok ? "Saved. The public site now uses these details." : data.error || "Could not save settings.");
  }

  return (
    <form onSubmit={save} className="card" style={{ maxWidth: 900 }}>
      <section>
        <h2 style={sectionHeading}>Contact details</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Phone" name="contactPhone" defaultValue={settings.contact.phone} />
          <Field label="Email" name="contactEmail" defaultValue={settings.contact.email} />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Type for every page</h2>
        <TypeFields prefix="site-type" value={settings.type} legend="Site-wide type" />
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Newsletter</h2>
        <label style={labelStyle}><input type="checkbox" name="news-hidden" defaultChecked={settings.newsletter?.hidden !== false} /> Hide the newsletter</label>
        <Field label="Label" name="news-eyebrow" defaultValue={settings.newsletter?.eyebrow ?? ""} />
        <Field label="Heading" name="news-heading" defaultValue={settings.newsletter?.heading ?? "Stay informed"} />
        <Field label="Introduction" name="news-body" defaultValue={settings.newsletter?.body ?? ""} multiline />
        <Field label="Email label" name="news-email-label" defaultValue={settings.newsletter?.emailLabel ?? "Email"} />
        <Field label="Placeholder" name="news-placeholder" defaultValue={settings.newsletter?.placeholder ?? "name@company.com"} />
        <Field label="Button" name="news-submit" defaultValue={settings.newsletter?.submitLabel ?? "Subscribe"} />
        <Field label="Consent" name="news-consent" defaultValue={settings.newsletter?.consent ?? ""} multiline />
        <Field label="Success message" name="news-success" defaultValue={settings.newsletter?.successMessage ?? "Thank you. You are subscribed."} />
        <Field label="Error message" name="news-error" defaultValue={settings.newsletter?.errorMessage ?? "Could not subscribe. Please try again."} />
        <Field label="Recipient email" name="news-recipient" defaultValue={settings.newsletter?.recipientEmail ?? settings.contact.email} />
        <Field label="Email subject" name="news-subject" defaultValue={settings.newsletter?.emailSubject ?? "Newsletter"} />
        <label style={labelStyle}>Delivery
          <select name="news-delivery" defaultValue={settings.newsletter?.delivery ?? "both"}>
            <option value="both">Save in the inbox and email the recipient</option>
            <option value="inbox">Save in the inbox only</option>
            <option value="email">Email the recipient only</option>
          </select>
        </label>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Header</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Contact button label" name="contactLabel" defaultValue={settings.chrome.contactLabel} />
          <Field label="Logo alt text" name="logoAlt" defaultValue={settings.chrome.logoAlt} />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Header navigation</h2>
        {settings.nav.map((item, index) => (
          <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label={`Item ${index + 1} label`} name={`nav-${index}-label`} defaultValue={item.label} />
            <Field label={`Item ${index + 1} link`} name={`nav-${index}-href`} defaultValue={item.href} />
          </div>
        ))}
        <p style={{ color: "var(--grey-5)", fontSize: ".8rem" }}>Leave a label empty to remove that item. Up to 8 items.</p>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Footer</h2>
        <LinesField label="Address" name="addressLines" lines={settings.address.lines} />
        <Field label="Brand copy" name="footerCopy" defaultValue={settings.brand.footerCopy} multiline />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="LinkedIn URL" name="linkedinUrl" defaultValue={settings.links.linkedin} />
          <Field label="Corporate website URL" name="corporateUrl" defaultValue={settings.links.corporate} />
        </div>
        {settings.footerColumns.map((column, index) => (
          <div key={index} style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 14 }}>
            <Field label={`Column ${index + 1} heading`} name={`column-${index}-heading`} defaultValue={column.heading} />
            <Field label="Links (Label | URL, one per line)" name={`column-${index}-links`} defaultValue={column.links.map((link) => `${link.label} | ${link.href}`).join("\n")} multiline />
          </div>
        ))}
        <Field label="Copyright line ({year} is replaced)" name="copyright" defaultValue={settings.copyright} />
        <Field label="Bottom links (Label | URL, one per line)" name="bottomLinks" defaultValue={settings.bottomLinks.map((link) => `${link.label} | ${link.href}`).join("\n")} multiline />
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Contact drawer copy</h2>
        <Field label="Label" name="drawerEyebrow" defaultValue={settings.drawerCopy.eyebrow} />
        <Field label="Heading" name="drawerHeading" defaultValue={settings.drawerCopy.heading} />
        <Field label="Introduction" name="drawerBody" defaultValue={settings.drawerCopy.body} multiline />
        <Field label="Directions label" name="drawerDirections" defaultValue={settings.drawerCopy.directionsLabel} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Name label" name="drawerName" defaultValue={settings.drawerCopy.nameLabel} />
          <Field label="Email label" name="drawerEmail" defaultValue={settings.drawerCopy.emailLabel} />
          <Field label="Message label" name="drawerMessage" defaultValue={settings.drawerCopy.messageLabel} />
        </div>
        <Field label="Submit label" name="drawerSubmit" defaultValue={settings.drawerCopy.submitLabel} />
        <Field label="Success message" name="drawerSuccess" defaultValue={settings.drawerCopy.successMessage} />
        <Field label="Direct contact prompt" name="drawerDirect" defaultValue={settings.drawerCopy.directPrompt} />
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Cookie banner</h2>
        <Field label="Title" name="cookieTitle" defaultValue={settings.cookie.title} />
        <Field label="Introduction" name="cookieBody" defaultValue={settings.cookie.body} multiline />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Policy link label" name="cookiePolicyLabel" defaultValue={settings.cookie.policyLabel} />
          <Field label="Policy link URL" name="cookiePolicyHref" defaultValue={settings.cookie.policyHref} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Manage label" name="cookieManage" defaultValue={settings.cookie.manageLabel} />
          <Field label="Necessary label" name="cookieNecessary" defaultValue={settings.cookie.necessaryLabel} />
          <Field label="Accept label" name="cookieAccept" defaultValue={settings.cookie.acceptLabel} />
          <Field label="Save label" name="cookieSave" defaultValue={settings.cookie.saveLabel} />
        </div>
        <Field label="Essential title" name="cookieEssentialTitle" defaultValue={settings.cookie.essentialTitle} />
        <Field label="Essential description" name="cookieEssentialBody" defaultValue={settings.cookie.essentialBody} multiline />
        <Field label="Analytics title" name="cookieAnalyticsTitle" defaultValue={settings.cookie.analyticsTitle} />
        <Field label="Analytics description" name="cookieAnalyticsBody" defaultValue={settings.cookie.analyticsBody} multiline />
        <Field label="Media title" name="cookieMediaTitle" defaultValue={settings.cookie.mediaTitle} />
        <Field label="Media description" name="cookieMediaBody" defaultValue={settings.cookie.mediaBody} multiline />
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Contact drawer locations</h2>
        {settings.drawer.locations.map((loc, index) => (
          <section key={index} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 16, marginBottom: 16 }}>
            <Field label="Location name" name={`loc-${index}-title`} defaultValue={loc.title} />
            <LinesField label="Address" name={`loc-${index}-lines`} lines={loc.lines} />
            <Field label="Map link" name={`loc-${index}-map`} defaultValue={loc.mapUrl} />
          </section>
        ))}
      </section>

      <button className="btn btn-dark" type="submit" disabled={saving} style={{ marginTop: 26 }}>
        {saving ? "Saving…" : "Save settings"}
      </button>
      {message && <p className={message.startsWith("Saved") ? "success-msg" : "error-msg"}>{message}</p>}
    </form>
  );
}
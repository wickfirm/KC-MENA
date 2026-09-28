"use client";

import { FormEvent, useState } from "react";
import type { NavItem, SiteSettings } from "@/lib/settings";

const inputStyle = { width: "100%", padding: "9px 10px", border: "1px solid var(--line)", marginTop: 5 };

function Field({ label, name, defaultValue, multiline = false }: { label: string; name: string; defaultValue: string; multiline?: boolean }) {
  return (
    <label style={{ display: "block", marginBottom: 14, fontSize: ".82rem", fontWeight: 700 }}>
      {label}
      {multiline ? <textarea name={name} defaultValue={defaultValue} rows={3} style={inputStyle} /> : <input name={name} defaultValue={defaultValue} style={inputStyle} />}
    </label>
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
    const next = {
      contact: { phone: value("contactPhone"), email: value("contactEmail") },
      address: { lines: splitLines("addressLines") },
      brand: { footerCopy: value("footerCopy") },
      links: { linkedin: value("linkedinUrl"), corporate: value("corporateUrl") },
      nav,
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
      <h2 style={{ fontSize: "1.05rem", marginBottom: 14 }}>Contact details</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Phone" name="contactPhone" defaultValue={settings.contact.phone} />
        <Field label="Email" name="contactEmail" defaultValue={settings.contact.email} />
      </div>

      <section style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 20 }}>
        <h2 style={{ fontSize: "1.05rem", marginBottom: 14 }}>Header navigation</h2>
        {settings.nav.map((item, index) => (
          <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label={`Item ${index + 1} label`} name={`nav-${index}-label`} defaultValue={item.label} />
            <Field label={`Item ${index + 1} link`} name={`nav-${index}-href`} defaultValue={item.href} />
          </div>
        ))}
        <p style={{ color: "var(--grey-5)", fontSize: ".8rem" }}>Leave a label empty to remove that item. Up to 8 items.</p>
      </section>

      <section style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 20 }}>
        <h2 style={{ fontSize: "1.05rem", marginBottom: 14 }}>Footer</h2>
        <LinesField label="Address" name="addressLines" lines={settings.address.lines} />
        <Field label="Brand copy" name="footerCopy" defaultValue={settings.brand.footerCopy} multiline />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="LinkedIn URL" name="linkedinUrl" defaultValue={settings.links.linkedin} />
          <Field label="Corporate website URL" name="corporateUrl" defaultValue={settings.links.corporate} />
        </div>
      </section>

      <section style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 20 }}>
        <h2 style={{ fontSize: "1.05rem", marginBottom: 14 }}>Contact drawer locations</h2>
        {settings.drawer.locations.map((loc, index) => (
          <section key={index} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 16, marginBottom: 16 }}>
            <Field label="Location name" name={`loc-${index}-title`} defaultValue={loc.title} />
            <LinesField label="Address" name={`loc-${index}-lines`} lines={loc.lines} />
            <Field label="Map link" name={`loc-${index}-map`} defaultValue={loc.mapUrl} />
          </section>
        ))}
      </section>

      {message && <p className={message.startsWith("Saved") ? "success-msg" : "error-msg"}>{message}</p>}
      <button className="btn btn-dark" disabled={saving}>
        {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
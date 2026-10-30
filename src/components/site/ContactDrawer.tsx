"use client";

import { FormEvent, useState } from "react";
import type { SiteSettings } from "@/lib/settings";

/** Same markup + IDs as the delivered static contact drawer —
 *  Open/close is controlled by SiteChrome; the enquiry form persists
 *  to the CMS (contact_submissions) instead of falling back to mailto:. */
export default function ContactDrawer({ settings, open, onClose, onHoverKeep, onHoverLeave }: { settings: SiteSettings; open: boolean; onClose: () => void; onHoverKeep: () => void; onHoverLeave: () => void }) {
  const [status, setStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const { contact, drawer, drawerCopy } = settings;

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    setIsSuccess(false);
    const form = event.currentTarget;
    try {
      const values = new FormData(form);
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          source: "contact-drawer",
          subject: "Kasumigaseki MENA inquiry",
          name: values.get("name"),
          email: values.get("email"),
          message: values.get("message"),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setStatus(data.error ?? "Could not send your enquiry. Please try again.");
        return;
      }
      form.reset();
      setIsSuccess(true);
      setStatus(drawerCopy.successMessage);
    } catch {
      setStatus("Could not send your enquiry. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={"contact-backdrop" + (open ? " open" : "")} id="contactBackdrop" onClick={onClose}></div>
      <aside className={"contact-drawer" + (open ? " open" : "")} id="contactDrawer" aria-label="Contact Kasumigaseki Capital" onMouseEnter={onHoverKeep} onMouseLeave={onHoverLeave}>
        <button className="drawer-close" id="drawerClose" aria-label="Close" onClick={onClose}>&times;</button>
        <div className="drawer-inner">
          <span className="eyebrow">{drawerCopy.eyebrow}</span>
          <h2 style={{ marginTop: 12, fontSize: "clamp(1.3rem,2vw,1.6rem)" }}>{drawerCopy.heading}</h2>
          <p style={{ marginTop: 12, color: "var(--grey-6)", fontSize: "0.92rem" }}>
            {drawerCopy.body}
          </p>

          <div className="drawer-locs">
            {drawer.locations.map((location) => (
              <div className="drawer-loc" key={location.title}>
                <h4>{location.title}</h4>
                <p>
                  {location.lines.map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < location.lines.length - 1 && <br />}
                    </span>
                  ))}
                </p>
                <a href={location.mapUrl} className="maplink" target="_blank" rel="noreferrer">{drawerCopy.directionsLabel}</a>
              </div>
            ))}
          </div>

          <form className="drawer-form" onSubmit={submitEnquiry}>
            <div className="form-field">
              <label htmlFor="dname">{drawerCopy.nameLabel}</label>
              <input type="text" id="dname" name="name" required />
            </div>
            <div className="form-field">
              <label htmlFor="demail">{drawerCopy.emailLabel}</label>
              <input type="email" id="demail" name="email" required />
            </div>
            <div className="form-field">
              <label htmlFor="dmessage">{drawerCopy.messageLabel}</label>
              <textarea id="dmessage" name="message" required></textarea>
            </div>
            <div className={`form-note${status ? " show" : ""}${status && !isSuccess ? " error-msg" : ""}`} id="drawerNote" role={isSuccess ? "status" : "alert"} aria-live="polite">
              {status}
            </div>
            <button type="submit" className="btn btn-solid" style={{ width: "100%", justifyContent: "center" }} disabled={busy}>
              {busy ? "Sending…" : drawerCopy.submitLabel}
            </button>
          </form>

          <div className="drawer-direct">
            {drawerCopy.directPrompt}
            {contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>}
            {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
          </div>
        </div>
      </aside>
    </>
  );
}

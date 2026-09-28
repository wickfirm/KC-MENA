"use client";

import { FormEvent, useState } from "react";
import type { SiteSettings } from "@/lib/settings";

/** Same markup + IDs as the delivered static contact drawer —
 *  /js/site.js continues to drive open/close. The enquiry form now persists
 *  to the CMS (contact_submissions) instead of falling back to mailto:. */
export default function ContactDrawer({ settings }: { settings: SiteSettings }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const { contact, drawer } = settings;

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const values = new FormData(event.currentTarget);
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
    setBusy(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setStatus(data.error ?? "Could not send your enquiry. Please try again.");
      return;
    }
    event.currentTarget.reset();
    setStatus("Thank you — your enquiry has been received.");
  }

  return (
    <>
      <div className="contact-backdrop" id="contactBackdrop"></div>
      <aside className="contact-drawer" id="contactDrawer" aria-label="Contact Kasumigaseki Capital">
        <button className="drawer-close" id="drawerClose" aria-label="Close">&times;</button>
        <div className="drawer-inner">
          <span className="eyebrow">Get in Touch</span>
          <h2 style={{ marginTop: 12, fontSize: "clamp(1.3rem,2vw,1.6rem)" }}>Contact Us</h2>
          <p style={{ marginTop: 12, color: "var(--grey-6)", fontSize: "0.92rem" }}>
            Reach the Kasumigaseki MENA team, or visit one of our company locations.
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
                <a href={location.mapUrl} className="maplink" target="_blank" rel="noreferrer">Get Directions &#8599;</a>
              </div>
            ))}
          </div>

          <form className="drawer-form" onSubmit={submitEnquiry}>
            <div className="form-field">
              <label htmlFor="dname">Full Name</label>
              <input type="text" id="dname" name="name" required />
            </div>
            <div className="form-field">
              <label htmlFor="demail">Email</label>
              <input type="email" id="demail" name="email" required />
            </div>
            <div className="form-field">
              <label htmlFor="dmessage">Message</label>
              <textarea id="dmessage" name="message" required></textarea>
            </div>
            <button type="submit" className="btn btn-solid" style={{ width: "100%", justifyContent: "center" }} disabled={busy}>
              {busy ? "Sending…" : "Send Enquiry"}
            </button>
            <div className={`form-note${status ? " show" : ""}`} id="drawerNote" aria-live="polite">
              {status || "Opens a direct line to our team."}
            </div>
          </form>

          <div className="drawer-direct">
            Prefer to reach us directly?
            {contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>}
            {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
          </div>
        </div>
      </aside>
    </>
  );
}

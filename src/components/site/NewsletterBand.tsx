"use client";

import { FormEvent, useState } from "react";
import type { SiteSettings } from "@/lib/settings";

export default function NewsletterBand({ newsletter }: { newsletter: NonNullable<SiteSettings["newsletter"]> }) {
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  if (newsletter.hidden) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "newsletter",
        source: "newsletter",
        name: email,
        email,
        subject: newsletter.emailSubject || "Newsletter",
        message: "Newsletter signup",
        recipientEmail: newsletter.recipientEmail,
        delivery: newsletter.delivery || "both",
      }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setDone(false);
      setNote(payload.error || newsletter.errorMessage || "Could not subscribe. Please try again.");
      return;
    }
    setDone(true);
    setNote(newsletter.successMessage);
    event.currentTarget.reset();
  }

  return (
    <section className="section" style={{ background: "var(--grey-1)" }}>
      <div className="wrap">
        {newsletter.eyebrow && <span className="eyebrow">{newsletter.eyebrow}</span>}
        <h2>{newsletter.heading}</h2>
        {newsletter.body && <p>{newsletter.body}</p>}
        <form onSubmit={submit} className="lead-form" style={{ marginTop: 18, maxWidth: 520 }}>
          <div className="lead-field">
            <label htmlFor="newsletter-email">{newsletter.emailLabel}</label>
            <input id="newsletter-email" name="email" type="email" required placeholder={newsletter.placeholder} />
          </div>
          <button className="btn btn-solid" type="submit">{newsletter.submitLabel}</button>
          {newsletter.consent && <p className="lead-note"><em>{newsletter.consent}</em></p>}
          {note && <p role="status" style={{ display: "block" }}>{done ? note : note}</p>}
        </form>
      </div>
    </section>
  );
}

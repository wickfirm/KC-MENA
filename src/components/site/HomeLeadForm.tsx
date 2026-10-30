"use client";

import { FormEvent, useState } from "react";

export default function HomeLeadForm({ form }: { form?: { nameLabel: string; emailLabel: string; emailPlaceholder: string; phoneLabel: string; interestLabel: string; interests: string[]; messageLabel: string; submitLabel: string; consent: string; successMessage: string; errorMessage?: string; recipientEmail?: string; emailSubject?: string; delivery?: "inbox" | "email" | "both" } }) {
  if (!form) return null;
  const copy = form;
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    if (!name || !email) { setMessage("Please add your name and email address."); return; }
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "enquiry",
        source: "home",
        name,
        email,
        phone: String(data.get("phone") ?? "").trim(),
        subject: copy.emailSubject || "Website enquiry",
        message: [`Interest: ${String(data.get("interest") ?? "")}`, String(data.get("message") ?? "").trim()].filter(Boolean).join("\n\n"),
        recipientEmail: copy.recipientEmail,
        delivery: copy.delivery || "both",
      }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setMessage(payload.error || copy.errorMessage || "Could not send your enquiry. Please try again.");
      return;
    }
    setMessage(copy.successMessage);
  }

  return <form className="lead-form" onSubmit={submit} noValidate>
    <div className="lead-field"><label htmlFor="lead-name">{copy.nameLabel}</label><input id="lead-name" name="name" type="text" autoComplete="name" required /></div>
    <div className="lead-field"><label htmlFor="lead-email">{copy.emailLabel}</label><input id="lead-email" name="email" type="email" autoComplete="email" placeholder={copy.emailPlaceholder} required /></div>
    <div className="lead-field"><label htmlFor="lead-phone">{copy.phoneLabel}</label><input id="lead-phone" name="phone" type="tel" autoComplete="tel" /></div>
    <div className="lead-field"><label htmlFor="lead-interest">{copy.interestLabel}</label><select id="lead-interest" name="interest">{copy.interests.map((interest) => <option key={interest}>{interest}</option>)}</select></div>
    <div className="lead-field full"><label htmlFor="lead-message">{copy.messageLabel}</label><textarea id="lead-message" name="message" /></div>
    <div className="full"><button type="submit" className="btn btn-solid">{copy.submitLabel}</button><p className="lead-note"><em>{copy.consent}</em></p>{message && <p className="lead-ok" role="status" style={{ display: "block" }}>{message}</p>}</div>
  </form>;
}

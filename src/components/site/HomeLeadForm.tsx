"use client";

import { FormEvent, useState } from "react";

export default function HomeLeadForm({ form }: { form?: { nameLabel: string; emailLabel: string; emailPlaceholder: string; phoneLabel: string; interestLabel: string; interests: string[]; messageLabel: string; submitLabel: string; consent: string; successMessage: string } }) {
  if (!form) return null;
  const copy = form;
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    if (!name || !email) { setMessage("Please add your name and email address."); return; }
    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${String(form.get("phone") ?? "").trim()}`,
      `Interest: ${String(form.get("interest") ?? "General enquiry")}`,
      "",
      String(form.get("message") ?? "").trim(),
    ];
    window.location.href = `mailto:info.dubai@kasumigaseki.co.jp?subject=${encodeURIComponent("Website enquiry")}&body=${encodeURIComponent(lines.join("\n"))}`;
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

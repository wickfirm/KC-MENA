"use client";

import { FormEvent, useState } from "react";

export default function HomeLeadForm() {
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
    setMessage("Your email client is opening with your enquiry.");
  }

  return <form className="lead-form" onSubmit={submit} noValidate>
    <div className="lead-field"><label htmlFor="lead-name">Full name</label><input id="lead-name" name="name" type="text" autoComplete="name" required /></div>
    <div className="lead-field"><label htmlFor="lead-email">Email</label><input id="lead-email" name="email" type="email" autoComplete="email" placeholder="name@company.com" required /></div>
    <div className="lead-field"><label htmlFor="lead-phone">Phone</label><input id="lead-phone" name="phone" type="tel" autoComplete="tel" /></div>
    <div className="lead-field"><label htmlFor="lead-interest">I&apos;m interested in</label><select id="lead-interest" name="interest"><option>Development</option><option>Investment &amp; Asset Management</option><option>Food &amp; Beverage</option><option>Careers</option><option>General enquiry</option></select></div>
    <div className="lead-field full"><label htmlFor="lead-message">Message</label><textarea id="lead-message" name="message" /></div>
    <div className="full"><button type="submit" className="btn btn-solid">Send enquiry</button><p className="lead-note">By submitting, you agree to be contacted about your enquiry. We never share your details.</p>{message && <p className="lead-ok" role="status" style={{ display: "block" }}>{message}</p>}</div>
  </form>;
}

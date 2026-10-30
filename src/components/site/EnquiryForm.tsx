"use client";

import { FormEvent, useState } from "react";

/** Contact-page enquiry form — markup mirrors the delivered .gen-form;
 *  submissions persist to /api/submissions instead of opening a mail client. */
export default function EnquiryForm({
  phone,
  email,
  eyebrow = "",
  heading = "",
  body = "",
  directPrompt = "",
  submitLabel = "",
  successMessage = "",
  nameLabel = "",
  emailLabel = "",
  phoneLabel = "",
  subjectLabel = "",
  messageLabel = "",
}: {
  phone: string;
  email: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  directPrompt?: string;
  submitLabel?: string;
  successMessage?: string;
  nameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  subjectLabel?: string;
  messageLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNote("");
    const values = new FormData(event.currentTarget);
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "enquiry",
        source: "contact-us",
        subject: values.get("csubject") || "Contact page enquiry",
        name: values.get("cname"),
        email: values.get("cemail"),
        phone: values.get("cphone"),
        message: values.get("cmessage"),
      }),
    });
    setBusy(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setNote(data.error ?? "Could not send your enquiry. Please try again.");
      setDone(false);
      return;
    }
    event.currentTarget.reset();
    setDone(true);
    setNote(successMessage);
  }

  return (
    <section className="section form-band">
      <div className="wrap">
        <div className="form-grid">
          <div className="form-info">
            <span className="eyebrow">{eyebrow}</span>
            <h2 style={{ marginTop: 14, fontSize: "clamp(1.4rem,2.2vw,1.8rem)" }}>{heading}</h2>
            <p>{body}</p>
            <div className="direct">
              {directPrompt}
              <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          </div>
          <form className="gen-form" onSubmit={submit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="cname">{nameLabel}</label>
                <input type="text" id="cname" name="cname" required />
              </div>
              <div className="form-field">
                <label htmlFor="cemail">{emailLabel}</label>
                <input type="email" id="cemail" name="cemail" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="cphone">{phoneLabel}</label>
                <input type="tel" id="cphone" name="cphone" />
              </div>
              <div className="form-field">
                <label htmlFor="csubject">{subjectLabel}</label>
                <input type="text" id="csubject" name="csubject" />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="cmessage">{messageLabel}</label>
              <textarea id="cmessage" name="cmessage" required />
            </div>
            <div style={{ marginTop: 16 }}>
              <button type="submit" className="btn btn-solid" disabled={busy}>{busy ? "Sending…" : submitLabel}</button>
            </div>
            <div className={`form-note${done ? " show" : ""}`} id="contactNote" aria-live="polite">
              {note || "Thank you — your enquiry has been noted. Our team will be in touch shortly."}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
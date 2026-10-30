"use client";

import { FormEvent, useState } from "react";

/** Contact form used inside the shared SectionContact band. Markup mirrors the
 *  delivered .contact-form; submissions persist to /api/submissions. */
export default function SectionContactForm({
  subjectLabel = "",
  subjectPlaceholder = "",
  submitLabel = "",
  successNote = "",
  subject = "Website enquiry",
  nameLabel = "",
  emailLabel = "",
  phoneLabel = "",
  messageLabel = "",
}: {
  subjectLabel?: string;
  subjectPlaceholder?: string;
  submitLabel?: string;
  successNote?: string;
  subject?: string;
  nameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  messageLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNote("");
    const form = event.currentTarget;
    try {
      const values = new FormData(form);
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "enquiry",
          source: "section-contact",
          subject,
          name: values.get("fname"),
          email: values.get("femail"),
          phone: values.get("fphone"),
          message: [values.get("fsubject") ? `Enquiry type: ${values.get("fsubject")}` : "", values.get("fmessage")]
            .filter(Boolean)
            .join("\n\n"),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setNote(data.error ?? "Could not send your enquiry. Please try again.");
        setDone(false);
        return;
      }
      form.reset();
      setDone(true);
      setNote(successNote);
    } catch {
      setDone(false);
      setNote("Could not send your enquiry. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="fname">{nameLabel}</label>
          <input type="text" id="fname" name="fname" required />
        </div>
        <div className="form-field">
          <label htmlFor="femail">{emailLabel}</label>
          <input type="email" id="femail" name="femail" required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="fphone">{phoneLabel}</label>
          <input type="tel" id="fphone" name="fphone" />
        </div>
        <div className="form-field">
          <label htmlFor="fsubject">{subjectLabel}</label>
          <input type="text" id="fsubject" name="fsubject" placeholder={subjectPlaceholder} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field full">
          <label htmlFor="fmessage">{messageLabel}</label>
          <textarea id="fmessage" name="fmessage" required />
        </div>
      </div>
      <div className={`form-note${note ? " show" : ""}${note && !done ? " error-msg" : ""}`} role={done ? "status" : "alert"} aria-live="polite">
        {note}
      </div>
      <button type="submit" className="btn btn-solid" disabled={busy}>
        {busy ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}

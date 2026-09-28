"use client";

import { FormEvent, useState } from "react";

/** Contact form used inside the shared SectionContact band. Markup mirrors the
 *  delivered .contact-form; submissions persist to /api/submissions. */
export default function SectionContactForm({
  subjectLabel = "Enquiry Type",
  subjectPlaceholder = "Development, Investment, F&B...",
  successNote = "Thank you — your enquiry has been received. Our team will be in touch shortly.",
  subject = "Website enquiry",
}: {
  subjectLabel?: string;
  subjectPlaceholder?: string;
  successNote?: string;
  subject?: string;
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
    setBusy(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setNote(data.error ?? "Could not send your enquiry. Please try again.");
      setDone(false);
      return;
    }
    event.currentTarget.reset();
    setDone(true);
    setNote(successNote);
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="fname">Full Name</label>
          <input type="text" id="fname" name="fname" required />
        </div>
        <div className="form-field">
          <label htmlFor="femail">Email</label>
          <input type="email" id="femail" name="femail" required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="fphone">Phone</label>
          <input type="tel" id="fphone" name="fphone" />
        </div>
        <div className="form-field">
          <label htmlFor="fsubject">{subjectLabel}</label>
          <input type="text" id="fsubject" name="fsubject" placeholder={subjectPlaceholder} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field full">
          <label htmlFor="fmessage">Message</label>
          <textarea id="fmessage" name="fmessage" required />
        </div>
      </div>
      <button type="submit" className="btn btn-solid" disabled={busy}>
        {busy ? "Sending…" : "Send Enquiry"}
      </button>
      <div className={`form-note${done ? " show" : ""}`} aria-live="polite">
        {note}
      </div>
    </form>
  );
}
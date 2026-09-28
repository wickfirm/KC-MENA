"use client";

import { FormEvent, useState } from "react";

/** Open-application form on the Careers page — markup mirrors the delivered
 *  .app-form; submissions persist to /api/submissions (type 'career').
 *  CV files are not stored server-side; the filename is noted on the message
 *  so the team can request the document directly. */
export default function OpenApplicationForm() {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNote("");
    const values = new FormData(event.currentTarget);
    const first = String(values.get("fname") ?? "").trim();
    const last = String(values.get("lname") ?? "").trim();
    const cv = values.get("fcv");
    const cvName = cv instanceof File && cv.name ? cv.name : "";
    const details = [
      `Business: ${values.get("fbusiness")}`,
      values.get("fmarket") ? `Preferred market: ${values.get("fmarket")}` : "",
      `Position: ${values.get("frole")}`,
      cvName ? `CV attached as: ${cvName} (document to follow by email)` : "",
      String(values.get("fmessage") ?? ""),
    ].filter(Boolean).join("\n");
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "career",
        source: "careers-open",
        subject: `Open application: ${values.get("fbusiness")}${values.get("frole") ? ` — ${values.get("frole")}` : ""}`,
        name: `${first} ${last}`.trim(),
        email: values.get("femail"),
        phone: values.get("fphone"),
        message: details,
      }),
    });
    setBusy(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setNote(data.error ?? "Could not submit your application. Please try again.");
      setDone(false);
      return;
    }
    event.currentTarget.reset();
    setDone(true);
    setNote("Thank you — your application has been received. Our team will be in touch shortly.");
  }

  return (
    <section className="section form-band">
      <div className="wrap">
        <div className="form-grid">
          <div className="form-info">
            <h3>Application Form</h3>
            <h2>Tell us where you&apos;d fit.</h2>
            <p>Complete the form below and a member of our team will be in touch using the details you provide.</p>
            <div className="office">
              <strong>Dubai Office</strong>
              Dubai Hills Estate<br />Business Park 4, Office 304-305<br />Dubai, UAE
            </div>
            <div className="office" style={{ borderTop: "none", paddingTop: 0, marginTop: 20 }}>
              <strong>Sales Centre</strong>
              Business Bay<br />Dubai, UAE
            </div>
          </div>
          <form className="app-form" onSubmit={submit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="fname">First Name *</label>
                <input type="text" id="fname" name="fname" required />
              </div>
              <div className="form-field">
                <label htmlFor="lname">Last Name *</label>
                <input type="text" id="lname" name="lname" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="femail">Email Address *</label>
                <input type="email" id="femail" name="femail" required />
              </div>
              <div className="form-field">
                <label htmlFor="fphone">Phone Number</label>
                <input type="tel" id="fphone" name="fphone" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="fbusiness">Business *</label>
                <select id="fbusiness" name="fbusiness" required defaultValue="">
                  <option value="">Select a business</option>
                  <option>Development</option>
                  <option>Investment &amp; Asset Management</option>
                  <option>Food &amp; Beverage</option>
                  <option>Corporate</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="fmarket">Preferred Market</label>
                <select id="fmarket" name="fmarket" defaultValue="">
                  <option value="">Select a market</option>
                  <option>Dubai</option>
                  <option>Tokyo</option>
                  <option>Kuala Lumpur</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field full">
                <label htmlFor="frole">Position Applying For *</label>
                <input type="text" id="frole" name="frole" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field full">
                <label htmlFor="fcv">Upload CV / Resume</label>
                <input type="file" id="fcv" name="fcv" accept=".pdf,.doc,.docx" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field full">
                <label htmlFor="fmessage">Message *</label>
                <textarea id="fmessage" name="fmessage" required />
              </div>
            </div>
            <div className="consent">
              <input type="checkbox" id="fconsent" name="fconsent" required />
              <label htmlFor="fconsent">I consent to being contacted by Kasumigaseki regarding this application.</label>
            </div>
            <button type="submit" className="btn btn-solid" disabled={busy}>
              {busy ? "Submitting…" : "Submit Application"}
            </button>
            <div className={`form-note${done ? " show" : ""}`} id="appNote" aria-live="polite">
              {note}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
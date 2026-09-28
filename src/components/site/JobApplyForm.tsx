"use client";

import { FormEvent, useState } from "react";

/** Inline apply form for a job opening — persists to contact_submissions
 *  with type 'career' and the jobId so submissions land in the CMS. */
export default function JobApplyForm({ jobId, jobTitle }: { jobId: number; jobTitle: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "career",
        source: "careers",
        jobId,
        subject: `Application: ${jobTitle}`,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setStatus(data.error ?? "Could not submit your application. Please try again.");
      return;
    }
    event.currentTarget.reset();
    setStatus("Thank you — your application has been received.");
  }

  if (!open) {
    return <button className="btn btn-outline" type="button" onClick={() => setOpen(true)}>Apply</button>;
  }

  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12, background: "var(--grey-1)", padding: 20, border: "1px solid var(--line)" }}>
        <strong style={{ fontSize: ".85rem" }}>Apply — {jobTitle}</strong>
        <input name="name" required placeholder="Full name" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input name="email" required type="email" placeholder="Email address" />
          <input name="phone" placeholder="Phone number (optional)" />
        </div>
        <textarea name="message" required rows={4} placeholder="Tell us about your experience — include a link to your CV or portfolio." />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btn-dark" disabled={busy}>{busy ? "Sending…" : "Submit application"}</button>
          <button className="btn" type="button" onClick={() => setOpen(false)}>Cancel</button>
        </div>
        {status && <p aria-live="polite" style={{ fontSize: ".85rem", color: status.startsWith("Thank") ? "inherit" : "#b5342c" }}>{status}</p>}
      </form>
    </div>
  );
}
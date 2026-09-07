"use client";

import { useState, FormEvent } from "react";

export default function PasswordForm() {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setDone(false);
    const f = new FormData(e.currentTarget);
    if (f.get("next") !== f.get("confirm")) {
      setError("New password and confirmation do not match");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: f.get("current"), next: f.get("next") }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Password change failed");
        return;
      }
      setDone(true);
      e.currentTarget.reset();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card" style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="current" style={labelStyle}>Current password</label>
        <input id="current" name="current" type="password" required autoComplete="current-password" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="next" style={labelStyle}>New password (min 10 chars, letters + numbers)</label>
        <input id="next" name="next" type="password" required minLength={10} autoComplete="new-password" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="confirm" style={labelStyle}>Confirm new password</label>
        <input id="confirm" name="confirm" type="password" required minLength={10} autoComplete="new-password" />
      </div>
      <button className="btn btn-dark" type="submit" disabled={saving}>
        {saving ? "Updating…" : "Update Password"}
      </button>
      {done && <p style={{ color: "#1d6b3f", fontWeight: 600, marginTop: 12 }}>Password updated — use it on your next sign-in.</p>}
      {error && <p className="error-msg" style={{ marginTop: 12 }}>{error}</p>}
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 5,
  color: "var(--grey-5)",
};

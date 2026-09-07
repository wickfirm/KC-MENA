"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign in failed");
        return;
      }
      router.replace(params.get("next") ?? "/admin");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div style={{ marginBottom: 14 }}>
        <label htmlFor="email" style={labelStyle}>Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label htmlFor="password" style={labelStyle}>Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {error && <p className="error-msg">{error}</p>}
      <button className="btn btn-dark" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 5,
  color: "var(--grey-5)",
};

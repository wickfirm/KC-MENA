"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export type TeamUser = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "editor";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 5,
  color: "var(--grey-5)",
};

export default function UsersManager({ initial, meId }: { initial: TeamUser[]; meId: number }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function call(url: string, method: string, body?: unknown): Promise<boolean> {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        router.refresh(); // re-sync controls (e.g. a role dropdown that was rejected)
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Network error — please try again");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const ok = await call("/api/users", "POST", {
      name: f.get("name"),
      email: f.get("email"),
      password: f.get("password"),
      role: f.get("role"),
    });
    if (ok) {
      form.reset();
      setNotice("Account created. Share the temporary password securely; they can change it under Account.");
    }
  }

  async function reset(user: TeamUser) {
    const password = window.prompt(`New password for ${user.name || user.email} (min 10 chars, letters + numbers):`);
    if (!password) return;
    if (await call(`/api/users/${user.id}`, "PUT", { password })) setNotice(`Password reset for ${user.name || user.email}.`);
  }

  async function remove(user: TeamUser) {
    if (!window.confirm(`Delete ${user.name || user.email}? This cannot be undone.`)) return;
    await call(`/api/users/${user.id}`, "DELETE");
  }

  return (
    <>
      {error && (
        <div className="card" style={{ borderLeft: "4px solid #b5342c", marginBottom: 16 }}>
          <span className="error-msg" style={{ margin: 0 }}>{error}</span>
        </div>
      )}
      {notice && <div className="card" style={{ borderLeft: "4px solid #1e6b2f", marginBottom: 16 }}>{notice}</div>}

      <div className="card" style={{ padding: 0, overflowX: "auto", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              {["Person", "Role", "Status", "Last sign-in", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", fontSize: ".72rem", color: "var(--grey-5)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initial.map((u) => {
              const isMe = u.id === meId;
              return (
                <tr key={u.id} style={{ borderTop: "1px solid var(--line)", opacity: u.is_active ? 1 : 0.6 }}>
                  <td style={{ padding: "12px 16px" }}>
                    <strong>{u.name || u.email}</strong>
                    {isMe ? " (you)" : ""}
                    <br />
                    {u.email}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      value={u.role}
                      disabled={busy}
                      onChange={(e) => call(`/api/users/${u.id}`, "PUT", { role: e.target.value })}
                      aria-label={`Role for ${u.email}`}
                    >
                      <option value="admin">Administrator</option>
                      <option value="editor">Editor</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`status-pill ${u.is_active ? "status-published" : "status-draft"}`}>
                      {u.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleString("en-GB") : "Never"}
                  </td>
                  <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                    <button className="btn" disabled={busy} onClick={() => reset(u)} style={{ marginRight: 6 }}>
                      Reset password
                    </button>
                    {!isMe && (
                      <button
                        className="btn"
                        disabled={busy}
                        onClick={() => call(`/api/users/${u.id}`, "PUT", { is_active: !u.is_active })}
                        style={{ marginRight: 6 }}
                      >
                        {u.is_active ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
                    {!isMe && (
                      <button className="btn btn-danger" disabled={busy} onClick={() => remove(u)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form onSubmit={create} className="card" style={{ maxWidth: 560 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 14 }}>Add a team member</h2>
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="u-name" style={labelStyle}>Full name</label>
          <input id="u-name" name="name" required />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="u-email" style={labelStyle}>Email (sign-in name)</label>
          <input id="u-email" name="email" type="email" required autoComplete="off" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="u-pass" style={labelStyle}>Temporary password (min 10 chars, letters + numbers)</label>
          <input id="u-pass" name="password" type="password" required minLength={10} autoComplete="new-password" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="u-role" style={labelStyle}>Role</label>
          <select id="u-role" name="role" defaultValue="editor">
            <option value="editor">Editor</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <button className="btn btn-dark" type="submit" disabled={busy}>
          {busy ? "Working…" : "Create account"}
        </button>
      </form>
    </>
  );
}

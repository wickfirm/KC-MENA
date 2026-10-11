"use client";

import { useState } from "react";

type Version = {
  id: number;
  version_number: number;
  label: string;
  author_email: string | null;
  author_name: string | null;
  created_at: string;
};

/**
 * Collapsible "Version history" panel for an editor page. Lists the most recent saved
 * versions of one record and restores one on confirmation (the page then reloads so
 * the editor shows the restored content). Loaded lazily when first opened.
 */
export default function VersionHistory({ entity, entityId }: { entity: string; entityId: string | number }) {
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (versions) return;
    try {
      const res = await fetch(`/api/versions?entity=${encodeURIComponent(entity)}&id=${encodeURIComponent(String(entityId))}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load version history");
      setVersions(data.versions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load version history");
    }
  }

  async function restore(v: Version) {
    if (!window.confirm(`Restore version ${v.version_number}? The current content is kept as a version, so you can undo this.`)) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/versions/${v.id}/restore`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not restore this version");
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not restore this version");
      setBusy(false);
    }
  }

  return (
    <details className="card" style={{ marginTop: 24, maxWidth: 760 }} onToggle={(e) => e.currentTarget.open && load()}>
      <summary style={{ cursor: "pointer", fontWeight: 700 }}>Version history</summary>
      <div style={{ marginTop: 12 }}>
        {error && <p className="error-msg">{error}</p>}
        {!versions && !error && <p style={{ color: "var(--grey-5)" }}>Loading…</p>}
        {versions && versions.length === 0 && (
          <p style={{ color: "var(--grey-5)" }}>No saved versions yet. A version is stored each time you save.</p>
        )}
        {versions && versions.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".85rem" }}>
            <tbody>
              {versions.map((v, i) => (
                <tr key={v.id} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 0", whiteSpace: "nowrap" }}>
                    <strong>v{v.version_number}</strong>
                    {i === 0 && <span style={{ color: "var(--grey-5)" }}> · current</span>}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    {new Date(v.created_at).toLocaleString("en-GB")}
                    <br />
                    <span style={{ color: "var(--grey-5)" }}>
                      {v.label} · {v.author_name || v.author_email || "unknown"}
                    </span>
                  </td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>
                    {i > 0 && (
                      <button type="button" className="btn" data-requires="publish" disabled={busy} onClick={() => restore(v)}>
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </details>
  );
}

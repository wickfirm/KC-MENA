"use client";

import { useEffect, useState } from "react";

type MediaItem = { id: number; url: string; filename: string; mime_type: string | null; alt: string | null };

export default function MediaPicker({ name, label, initialUrl }: { name: string; label: string; initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || items.length || loading) return;
    setLoading(true);
    fetch("/api/media").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not load media");
      setItems(data.media.filter((item: MediaItem) => item.mime_type?.startsWith("image/")));
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load media")).finally(() => setLoading(false));
  }, [items.length, loading, open]);

  return <div style={{ marginBottom: 14 }}>
    <span style={{ display: "block", fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5, color: "var(--grey-5)" }}>{label}</span>
    <input type="hidden" name={name} value={url} />
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      {url ? <img src={url} alt="Selected media" style={{ width: 78, height: 52, objectFit: "cover", border: "1px solid var(--line)" }} /> : <span style={{ width: 78, height: 52, background: "var(--grey-1)", border: "1px solid var(--line)" }} />}
      <button className="btn" type="button" onClick={() => setOpen(true)}>Choose from library</button>
      {url && <button className="btn" type="button" onClick={() => setUrl("")}>Clear</button>}
      <a href="/admin/media" target="_blank" style={{ fontSize: ".8rem", textDecoration: "underline" }}>Manage media</a>
    </div>
    {open && <div role="dialog" aria-modal="true" aria-label={`Choose ${label}`} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,.42)", padding: 30, overflowY: "auto" }} onMouseDown={() => setOpen(false)}><div className="card" style={{ maxWidth: 960, margin: "20px auto" }} onMouseDown={(event) => event.stopPropagation()}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}><h2 style={{ fontSize: "1.2rem" }}>Choose image</h2><button className="btn" type="button" onClick={() => setOpen(false)}>Close</button></div>{loading && <p>Loading media…</p>}{error && <p className="error-msg">{error}</p>}{!loading && !error && items.length === 0 && <p>No uploaded images yet. Use Manage media to upload one.</p>}<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>{items.map((item) => <button key={item.id} type="button" onClick={() => { setUrl(item.url); setOpen(false); }} style={{ textAlign: "left", border: "1px solid var(--line)", background: "var(--white)", padding: 0, cursor: "pointer" }}><img src={item.url} alt={item.alt || item.filename} style={{ width: "100%", height: 105, objectFit: "cover" }} /><span style={{ display: "block", padding: 8, fontSize: ".75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.filename}</span></button>)}</div></div></div>}
  </div>;
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type MediaRow = {
  id: number;
  url: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

function fmtSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibrary({ rows }: { rows: MediaRow[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function upload(file: File) {
    setError("");
    setMessage("");
    setUploading(true);
    try {
      // 1) presign  2) PUT straight to R2  3) register the asset
      const presignRes = await fetch("/api/media/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      });
      const presign = await presignRes.json();
      if (!presignRes.ok) throw new Error(presign.error ?? "Could not start upload");

      const putRes = await fetch(presign.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!putRes.ok) throw new Error("Upload to storage failed — please retry");

      const regRes = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: presign.publicUrl,
          filename: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        }),
      });
      if (!regRes.ok) {
        const data = await regRes.json();
        throw new Error(data.error ?? "Upload succeeded but registering failed");
      }
      setMessage(`Uploaded "${file.name}".`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function remove(id: number, filename: string) {
    if (!confirm(`Remove "${filename}" from the library? (The file stays in storage.)`)) return;
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("URL copied to clipboard.");
    } catch {
      setError("Could not copy — select the URL manually.");
    }
  }

  return (
    <>
      <div className="card" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <input
          ref={fileInput}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />
        <button className="btn btn-dark" onClick={() => fileInput.current?.click()} disabled={uploading}>
          {uploading ? "Uploading…" : "⬆ Upload Image / PDF"}
        </button>
        <span style={{ color: "var(--grey-5)", fontSize: "0.82rem" }}>
          Images or PDFs up to 25 MB — stored on Cloudflare R2, uploaded directly from your browser.
        </span>
      </div>
      {message && <p style={{ color: "#1d6b3f", fontWeight: 600, marginBottom: 12 }}>{message}</p>}
      {error && <p className="error-msg" style={{ marginBottom: 12 }}>{error}</p>}

      {rows.length === 0 ? (
        <div className="card">No media yet — upload the first file above.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {rows.map((m) => {
            const isImage = m.mime_type?.startsWith("image/");
            return (
              <div key={m.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ height: 130, background: "var(--grey-1)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.filename} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "1.8rem" }}>📄</span>
                  )}
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <p style={{ fontWeight: 600, fontSize: "0.8rem", wordBreak: "break-all", marginBottom: 4 }}>{m.filename}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--grey-5)", marginBottom: 8 }}>
                    {fmtSize(m.size_bytes)} · {new Date(m.created_at).toLocaleDateString("en-GB")}
                  </p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn" style={{ padding: "4px 8px", fontSize: "0.7rem" }} onClick={() => copyUrl(m.url)}>
                      Copy URL
                    </button>
                    <a href={m.url} target="_blank" rel="noopener" className="btn" style={{ padding: "4px 8px", fontSize: "0.7rem", textDecoration: "none" }}>
                      View
                    </a>
                    <button className="btn btn-danger" style={{ padding: "4px 8px", fontSize: "0.7rem", marginLeft: "auto" }} onClick={() => remove(m.id, m.filename)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

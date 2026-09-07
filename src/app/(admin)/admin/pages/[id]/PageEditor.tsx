"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Page = {
  id: number;
  slug: string;
  title: string;
  status: string;
  content: { meta?: string; body?: string } | null;
  seo: { title?: string; description?: string } | null;
};

export default function PageEditor({ page }: { page: Page | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const f = new FormData(e.currentTarget);
    const payload = {
      slug: page ? undefined : f.get("slug"),
      title: f.get("title"),
      status: f.get("status"),
      content: { meta: f.get("meta"), body: f.get("body") },
      seo: { title: f.get("seo_title"), description: f.get("seo_description") },
    };
    try {
      const res = await fetch(page ? `/api/pages/${page.id}` : "/api/pages", {
        method: page ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      router.push("/admin/pages");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card" style={{ maxWidth: 860 }}>
      <div style={{ display: "grid", gridTemplateColumns: page ? "1fr 160px" : "1fr 1fr 160px", gap: 16, marginBottom: 16 }}>
        <div>
          <label htmlFor="title" style={labelStyle}>Title</label>
          <input id="title" name="title" required defaultValue={page?.title ?? ""} />
        </div>
        {!page && (
          <div>
            <label htmlFor="slug" style={labelStyle}>Slug</label>
            <input id="slug" name="slug" required defaultValue="" placeholder="e.g. about-us" />
          </div>
        )}
        <div>
          <label htmlFor="status" style={labelStyle}>Status</label>
          <select id="status" name="status" defaultValue={page?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="meta" style={labelStyle}>Meta aside (e.g. &ldquo;Last updated&rdquo; block — basic HTML allowed)</label>
        <textarea id="meta" name="meta" rows={3} defaultValue={page?.content?.meta ?? ""} style={{ fontFamily: "monospace", fontSize: "0.82rem" }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="body" style={labelStyle}>Body (HTML — h2 / p / ul / a supported)</label>
        <textarea id="body" name="body" rows={20} defaultValue={page?.content?.body ?? ""} style={{ fontFamily: "monospace", fontSize: "0.82rem" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label htmlFor="seo_title" style={labelStyle}>SEO title</label>
          <input id="seo_title" name="seo_title" defaultValue={page?.seo?.title ?? ""} placeholder="Page | Kasumigaseki MENA" />
        </div>
        <div>
          <label htmlFor="seo_description" style={labelStyle}>SEO description</label>
          <input id="seo_description" name="seo_description" defaultValue={page?.seo?.description ?? ""} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-dark" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save (creates revision)"}
        </button>
        <button type="button" className="btn" onClick={() => router.push("/admin/pages")}>
          Cancel
        </button>
      </div>
      {error && <p className="error-msg">{error}</p>}
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

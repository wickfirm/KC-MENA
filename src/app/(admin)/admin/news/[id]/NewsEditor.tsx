"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { NewsPost } from "./page";

export default function NewsEditor({ post }: { post: NewsPost | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save(e: FormEvent<HTMLFormElement>, status: string) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const f = new FormData(e.currentTarget);
    const payload = {
      title: f.get("title"),
      slug: f.get("slug"),
      category: f.get("category"),
      excerpt: f.get("excerpt"),
      body: f.get("body"),
      cover_image: f.get("cover_image"),
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    };
    try {
      const res = await fetch(post ? `/api/news/${post.id}` : "/api/news", {
        method: post ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      router.push("/admin/news");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!post) return;
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/news/${post.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Delete failed");
        return;
      }
      router.push("/admin/news");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form
      onSubmit={(e) => save(e, (e.currentTarget.elements.namedItem("status") as HTMLSelectElement)?.value ?? "draft")}
      className="card"
      style={{ maxWidth: 760 }}
    >
      <Field label="Title" htmlFor="title">
        <input id="title" name="title" required defaultValue={post?.title ?? ""} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Slug (URL)" htmlFor="slug">
          <input id="slug" name="slug" required defaultValue={post?.slug ?? ""} placeholder="e.g. new-dubai-office" />
        </Field>
        <Field label="Category" htmlFor="category">
          <input id="category" name="category" defaultValue={post?.category ?? ""} placeholder="e.g. Company News" />
        </Field>
      </div>

      <Field label="Cover Image URL (optional)" htmlFor="cover_image">
        <input id="cover_image" name="cover_image" defaultValue={post?.cover_image ?? ""} placeholder="/images/…" />
      </Field>

      <Field label="Excerpt" htmlFor="excerpt">
        <textarea id="excerpt" name="excerpt" rows={2} defaultValue={post?.excerpt ?? ""} />
      </Field>

      <Field label="Body" htmlFor="body">
        <textarea id="body" name="body" rows={12} defaultValue={post?.body ?? ""} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Status" htmlFor="status">
          <select id="status" name="status" defaultValue={post?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          <button className="btn btn-dark" type="submit" disabled={saving || deleting}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn" onClick={() => router.push("/admin/news")}>
            Cancel
          </button>
          {post && (
            <button type="button" className="btn btn-danger" onClick={remove} disabled={saving || deleting}>
              {deleting ? "…" : "Delete"}
            </button>
          )}
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={htmlFor} style={labelStyle}>{label}</label>
      {children}
    </div>
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

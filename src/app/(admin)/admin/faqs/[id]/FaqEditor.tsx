"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Faq = {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_published: boolean;
};

export default function FaqEditor({ faq }: { faq: Faq | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const f = new FormData(e.currentTarget);
    const payload = {
      question: f.get("question"),
      answer: f.get("answer"),
      category: f.get("category"),
      sort_order: Number(f.get("sort_order") ?? 0) || 0,
      is_published: f.get("is_published") === "on",
    };
    try {
      const res = await fetch(faq ? `/api/faqs/${faq.id}` : "/api/faqs", {
        method: faq ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      router.push("/admin/faqs");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="question" style={labelStyle}>Question</label>
        <input id="question" name="question" required defaultValue={faq?.question ?? ""} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="answer" style={labelStyle}>Answer</label>
        <textarea id="answer" name="answer" required rows={6} defaultValue={faq?.answer ?? ""} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, alignItems: "end", marginBottom: 16 }}>
        <div>
          <label htmlFor="category" style={labelStyle}>Category</label>
          <input id="category" name="category" defaultValue={faq?.category ?? "General"} placeholder="e.g. Company" />
        </div>
        <div>
          <label htmlFor="sort_order" style={labelStyle}>Sort order</label>
          <input id="sort_order" name="sort_order" type="number" defaultValue={faq?.sort_order ?? 0} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 10, fontSize: "0.85rem", fontWeight: 600 }}>
          <input type="checkbox" name="is_published" defaultChecked={faq ? faq.is_published : true} style={{ width: "auto" }} />
          Published
        </label>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-dark" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" className="btn" onClick={() => router.push("/admin/faqs")}>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: number;
  title: string;
  link: string;
  summary: string | null;
  source_name: string | null;
  published_at: string | null;
  status: string;
  news_post_id: number | null;
};

/** Feed-item review queue: approve creates a draft news post, reject hides the item. */
export default function RssReview({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function review(id: number, action: "approve" | "reject") {
    setBusyId(id);
    setError("");
    const response = await fetch(`/api/rss/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await response.json().catch(() => ({}));
    setBusyId(null);
    if (!response.ok) {
      setError(data.error ?? "Could not update the item.");
      return;
    }
    router.refresh();
  }

  if (!initial.length) return <p style={{ color: "var(--grey-5)", marginTop: 10 }}>No imported feed items yet. Use “Fetch feeds now” to pull the latest entries.</p>;

  return (
    <div style={{ marginTop: 12 }}>
      {error && <p className="error-msg">{error}</p>}
      {initial.map((item) => (
        <div key={item.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <a href={item.link} target="_blank" rel="noreferrer" style={{ fontWeight: 700, textDecoration: "underline" }}>{item.title}</a>
            <p style={{ color: "var(--grey-5)", fontSize: ".8rem", marginTop: 4 }}>
              {item.source_name ?? "Unknown source"}
              {item.published_at ? ` · ${new Date(item.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}
              {item.status === "approved" && item.news_post_id ? " · approved as draft news post" : item.status === "rejected" ? " · rejected" : ""}
            </p>
            {item.summary && <p style={{ fontSize: ".82rem", marginTop: 6, color: "var(--grey-5)" }}>{item.summary.slice(0, 220)}{item.summary.length > 220 ? "…" : ""}</p>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {item.status === "pending" && <>
              <button className="btn btn-dark" disabled={busyId === item.id} onClick={() => review(item.id, "approve")}>{busyId === item.id ? "…" : "Approve"}</button>
              <button className="btn btn-danger" disabled={busyId === item.id} onClick={() => review(item.id, "reject")}>Reject</button>
            </>}
            {item.status === "approved" && item.news_post_id && <a className="btn" href="/admin/news">Open in News</a>}
            {item.status === "rejected" && <span className="status-pill status-draft">Rejected</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** "Fetch feeds now" — pulls every active source into the review queue. */
export default function RssIngest() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/rss/ingest", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error ?? "Could not fetch feeds.");
      } else {
        const failed = (data.sources ?? []).filter((s: { ok: boolean }) => !s.ok);
        setMessage(
          failed.length
            ? `Imported ${data.imported} new item(s); ${failed.length} feed(s) failed: ${failed.map((s: { source: string }) => s.source).join(", ")}.`
            : `Imported ${data.imported} new item(s) from ${data.sources.length} feed(s).`
        );
        router.refresh();
      }
    } catch {
      setMessage("Could not fetch feeds.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
      <button className="btn btn-dark" onClick={run} disabled={busy}>
        {busy ? "Fetching feeds…" : "Fetch feeds now"}
      </button>
      {message && <span style={{ fontSize: ".82rem", color: "var(--grey-5)" }}>{message}</span>}
    </div>
  );
}
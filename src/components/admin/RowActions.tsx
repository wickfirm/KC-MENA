"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * One-click row actions for list screens: publish / unpublish and duplicate.
 * Copies are always created unpublished (see /api/content/[entity]/[id]).
 */
export default function RowActions({
  entity,
  id,
  live,
  showPublish = true,
}: {
  entity: "news" | "job" | "project" | "faq";
  id: number;
  /** Whether the record is currently published/open. */
  live: boolean;
  showPublish?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: "publish" | "unpublish" | "duplicate") {
    if (action === "unpublish" && !window.confirm("Unpublish this? It will disappear from the public site.")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/content/${entity}/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Action failed");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  const small = { padding: "4px 10px", fontSize: "0.7rem", marginLeft: 8 } as const;
  return (
    <>
      {showPublish && (
        <button type="button" className="btn" style={small} disabled={busy} onClick={() => run(live ? "unpublish" : "publish")}>
          {live ? "Unpublish" : "Publish"}
        </button>
      )}
      <button type="button" className="btn" style={small} disabled={busy} onClick={() => run("duplicate")}>
        Duplicate
      </button>
      {error && <span className="error-msg" style={{ marginLeft: 8 }}>{error}</span>}
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Publish-toggle + delete for a FAQ row. */
export default function FaqRowActions({ id, isPublished }: { id: number; isPublished: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    await fetch(`/api/faqs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !isPublished }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this question?")) return;
    setBusy(true);
    await fetch(`/api/faqs/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={toggle} disabled={busy} className="btn" style={{ padding: "4px 10px", fontSize: "0.7rem" }}>
        {isPublished ? "Unpublish" : "Publish"}
      </button>
      <button onClick={remove} disabled={busy} className="btn btn-danger" style={{ padding: "4px 10px", fontSize: "0.7rem", marginLeft: 8 }}>
        Delete
      </button>
    </>
  );
}

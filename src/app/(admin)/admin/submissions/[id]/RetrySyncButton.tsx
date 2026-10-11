"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RetrySyncButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function retry() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/submissions/${id}/retry`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error ?? "Sync failed");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-requires="publish" style={{ marginTop: 12 }}>
      <button type="button" className="btn btn-dark" disabled={busy} onClick={retry}>
        {busy ? "Syncing…" : "Retry sync"}
      </button>
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

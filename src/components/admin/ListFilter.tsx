"use client";

import { useEffect, useState } from "react";

/**
 * Search box + status chips for a list screen. Filters the server-rendered rows in the
 * browser: each row carries data-list-row, data-status and data-search attributes.
 */
export default function ListFilter({
  placeholder = "Search",
  statuses,
}: {
  placeholder?: string;
  statuses: { value: string; label: string }[];
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    const needle = q.trim().toLowerCase();
    const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-list-row]"));
    let visible = 0;
    for (const row of rows) {
      const match =
        (!status || row.dataset.status === status) && (!needle || (row.dataset.search ?? "").toLowerCase().includes(needle));
      row.style.display = match ? "" : "none";
      if (match) visible += 1;
    }
    setShown(rows.length ? visible : null);
  }, [q, status]);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 16 }}>
      {/* type=search inside no <form>: typing here is not an unsaved edit */}
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{ maxWidth: 260 }}
      />
      <button type="button" className={`btn ${!status ? "btn-dark" : ""}`} onClick={() => setStatus("")}>
        All
      </button>
      {statuses.map((s) => (
        <button key={s.value} type="button" className={`btn ${status === s.value ? "btn-dark" : ""}`} onClick={() => setStatus(s.value)}>
          {s.label}
        </button>
      ))}
      {shown !== null && (q || status) && <span style={{ color: "var(--grey-5)", fontSize: ".8rem" }}>{shown} shown</span>}
    </div>
  );
}

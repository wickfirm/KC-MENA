import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageRow = {
  id: number;
  slug: string;
  title: string;
  status: string;
  updated_at: string;
};

/** Pages that already have a live front-end route. */
const LIVE_SLUGS: Record<string, string> = {
  "privacy-policy": "/privacy-policy/",
  "terms-and-conditions": "/terms-and-conditions/",
  "cookie-policy": "/cookie-policy/",
  "legal-notice": "/legal-notice/",
  faq: "/faq/",
};

export default async function PagesAdminPage() {
  let rows: PageRow[] = [];
  let dbError: string | null = null;
  try {
    rows = await query<PageRow>(
      "SELECT id, slug, title, status, updated_at FROM pages ORDER BY slug ASC"
    );
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database unavailable";
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h1 style={{ fontSize: "1.6rem" }}>Pages</h1>
        <Link href="/admin/pages/new" className="btn btn-dark">+ New Page</Link>
      </div>
      <p style={{ color: "var(--grey-5)", marginBottom: 18 }}>
        Every save creates a revision snapshot. Legal page content was seeded from the delivered site and is
        ready for the final text from the client&rsquo;s legal counsel.
      </p>

      {dbError && (
        <div className="card" style={{ borderLeft: "4px solid #b5342c", marginBottom: 20 }}>
          Database not connected — set <code>DATABASE_URL</code> and apply <code>db/schema.sql</code>.
        </div>
      )}

      {rows.length > 0 && (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
                {["Title", "Slug", "Live URL", "Status", "Updated", ""].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--grey-5)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--grey-1)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{r.title}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: "0.8rem" }}>{r.slug}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {LIVE_SLUGS[r.slug] ? (
                      <a href={LIVE_SLUGS[r.slug]} target="_blank" style={{ textDecoration: "underline" }}>{LIVE_SLUGS[r.slug]}</a>
                    ) : (
                      <span style={{ color: "var(--grey-5)" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`status-pill ${r.status === "published" ? "status-published" : "status-draft"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--grey-5)" }}>
                    {new Date(r.updated_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Link href={`/admin/pages/${r.id}`} style={{ fontWeight: 700, textDecoration: "underline" }}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!dbError && rows.length === 0 && (
        <div className="card">
          No pages yet — apply <code>db/seed-pages.sql</code> to load the legal pages, or{" "}
          <Link href="/admin/pages/new" style={{ textDecoration: "underline", fontWeight: 700 }}>create one</Link>.
        </div>
      )}
    </>
  );
}


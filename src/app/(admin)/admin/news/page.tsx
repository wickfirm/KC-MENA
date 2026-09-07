import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type NewsRow = {
  id: number;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  source: string;
  published_at: string | null;
  updated_at: string;
};

export default async function NewsListPage() {
  let rows: NewsRow[] = [];
  let dbError: string | null = null;
  try {
    rows = await query<NewsRow>(
      "SELECT id, title, slug, category, status, source, published_at, updated_at FROM news_posts ORDER BY updated_at DESC LIMIT 100"
    );
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database unavailable";
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h1 style={{ fontSize: "1.6rem" }}>News</h1>
        <Link href="/admin/news/new" className="btn btn-dark">+ New Post</Link>
      </div>

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
                {["Title", "Category", "Status", "Source", "Published", ""].map((h) => (
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
                  <td style={{ padding: "12px 16px" }}>{r.category ?? "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`status-pill status-${r.status}`}>{r.status.replace("_", " ")}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>{r.source}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {r.published_at ? new Date(r.published_at).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Link href={`/admin/news/${r.id}`} style={{ fontWeight: 700, textDecoration: "underline" }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!dbError && rows.length === 0 && (
        <div className="card">No news posts yet. <Link href="/admin/news/new" style={{ textDecoration: "underline", fontWeight: 700 }}>Create the first one</Link>.</div>
      )}
    </>
  );
}

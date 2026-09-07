import Link from "next/link";
import { query } from "@/lib/db";
import FaqRowActions from "./FaqRowActions";

export const dynamic = "force-dynamic";

type FaqRow = {
  id: number;
  question: string;
  category: string | null;
  sort_order: number;
  is_published: boolean;
};

export default async function FaqsAdminPage() {
  let rows: FaqRow[] = [];
  let dbError: string | null = null;
  try {
    rows = await query<FaqRow>(
      "SELECT id, question, category, sort_order, is_published FROM faqs ORDER BY sort_order ASC, id ASC"
    );
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database unavailable";
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h1 style={{ fontSize: "1.6rem" }}>FAQ</h1>
        <Link href="/admin/faqs/new" className="btn btn-dark">+ New Question</Link>
      </div>
      <p style={{ color: "var(--grey-5)", marginBottom: 18 }}>
        Published questions appear on the <a href="/faq/" target="_blank" style={{ textDecoration: "underline", fontWeight: 600 }}>/faq</a> page, grouped by category, in sort order.
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
                {["Sort", "Question", "Category", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--grey-5)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--grey-1)" }}>
                  <td style={{ padding: "12px 16px" }}>{r.sort_order}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{r.question}</td>
                  <td style={{ padding: "12px 16px" }}>{r.category ?? "General"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`status-pill ${r.is_published ? "status-published" : "status-draft"}`}>
                      {r.is_published ? "Published" : "Hidden"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                    <Link href={`/admin/faqs/${r.id}`} style={{ fontWeight: 700, textDecoration: "underline", marginRight: 14 }}>
                      Edit
                    </Link>
                    <FaqRowActions id={r.id} isPublished={r.is_published} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!dbError && rows.length === 0 && (
        <div className="card">
          No FAQs yet — apply <code>db/seed-faqs.sql</code> for the starter content, or{" "}
          <Link href="/admin/faqs/new" style={{ textDecoration: "underline", fontWeight: 700 }}>create the first question</Link>.
        </div>
      )}
    </>
  );
}

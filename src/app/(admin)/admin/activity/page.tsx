import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { query } from "@/lib/db";
import { activityActionLabels, type ActivityAction } from "@/lib/activity";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type Row = {
  id: number;
  action: string;
  summary: string;
  actor_email: string | null;
  actor_name: string | null;
  created_at: string;
};

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const filter = first(params.action);
  const action = filter in activityActionLabels ? (filter as ActivityAction) : "";
  const page = Math.max(1, Math.floor(Number(first(params.page))) || 1);

  let rows: Row[] = [];
  let total = 0;
  let dbError = false;
  try {
    const where = action ? "WHERE action = $1" : "";
    const args = action ? [action] : [];
    rows = await query<Row>(
      `SELECT id, action, summary, actor_email, actor_name, created_at FROM activity_log ${where}
       ORDER BY created_at DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
      args
    );
    const count = await query<{ n: number }>(`SELECT count(*)::int AS n FROM activity_log ${where}`, args);
    total = count[0]?.n ?? 0;
  } catch {
    dbError = true;
  }
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (a: string, p = 1) => {
    const parts = [a ? `action=${a}` : "", p > 1 ? `page=${p}` : ""].filter(Boolean);
    return `/admin/activity${parts.length ? `?${parts.join("&")}` : ""}`;
  };

  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>Activity log</h1>
      <p style={{ color: "var(--grey-5)", marginBottom: 20 }}>
        Who changed what, and when. Read-only; visible to administrators only.
      </p>
      {dbError ? (
        <div className="card">
          Database not connected, or the governance migration (<code>db/migrations/001-governance.sql</code>) has not
          been applied yet.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            <Link className={`btn ${!action ? "btn-dark" : ""}`} href={href("")}>
              All
            </Link>
            {(Object.keys(activityActionLabels) as ActivityAction[]).map((a) => (
              <Link key={a} className={`btn ${action === a ? "btn-dark" : ""}`} href={href(a)}>
                {activityActionLabels[a]}
              </Link>
            ))}
          </div>
          {rows.length === 0 ? (
            <div className="card">No activity recorded yet.</div>
          ) : (
            <div className="card" style={{ padding: 0, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    {["When", "Who", "What"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: ".72rem", color: "var(--grey-5)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} style={{ borderTop: "1px solid var(--line)" }}>
                      <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                        {new Date(r.created_at).toLocaleString("en-GB")}
                      </td>
                      <td style={{ padding: "10px 16px" }}>{r.actor_name || r.actor_email || "—"}</td>
                      <td style={{ padding: "10px 16px" }}>{r.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <p style={{ marginTop: 16, display: "flex", gap: 14, alignItems: "center" }}>
              {page > 1 && <Link href={href(action, page - 1)}>← Newer</Link>}
              <span style={{ color: "var(--grey-5)" }}>Page {page} of {pages}</span>
              {page < pages && <Link href={href(action, page + 1)}>Older →</Link>}
            </p>
          )}
        </>
      )}
    </>
  );
}

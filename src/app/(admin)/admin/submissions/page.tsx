import Link from "next/link";
import { query } from "@/lib/db";
import { SUBMISSION_TYPES, SYNC_STATES } from "@/lib/submissions";
import { isSalesforceConfigured } from "@/lib/salesforce";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type Row = {
  id: number;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  sf_sync_status: string;
  has_cv: boolean;
  created_at: string;
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const TYPE_LABELS: Record<string, string> = { contact: "Contact", enquiry: "Enquiry", career: "Career", newsletter: "Newsletter" };

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const type = (SUBMISSION_TYPES as readonly string[]).includes(first(params.type)) ? first(params.type) : "";
  const sync = (SYNC_STATES as readonly string[]).includes(first(params.sync)) ? first(params.sync) : "";
  const q = first(params.q).trim().slice(0, 100);
  const page = Math.max(1, Math.floor(Number(first(params.page))) || 1);

  const conds: string[] = [];
  const args: unknown[] = [];
  if (type) { args.push(type); conds.push(`type = $${args.length}`); }
  if (sync) { args.push(sync); conds.push(`sf_sync_status = $${args.length}`); }
  if (q) { args.push(`%${q}%`); conds.push(`(name ILIKE $${args.length} OR email ILIKE $${args.length} OR COALESCE(subject,'') ILIKE $${args.length} OR COALESCE(message,'') ILIKE $${args.length})`); }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

  let rows: Row[] = [];
  let total = 0;
  let error = false;
  try {
    rows = await query<Row>(
      `SELECT id, type, name, email, phone, subject, message, sf_sync_status, (meta->'cv') IS NOT NULL AND (meta->>'cv') <> 'null' AS has_cv, created_at
       FROM contact_submissions ${where} ORDER BY created_at DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
      args
    );
    total = (await query<{ n: number }>(`SELECT count(*)::int AS n FROM contact_submissions ${where}`, args))[0]?.n ?? 0;
  } catch {
    error = true;
  }
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (over: Record<string, string | number>) => {
    const next: Record<string, string | number> = { type, sync, q, page: 1, ...over };
    const qs = Object.entries(next).filter(([, v]) => v !== "" && v !== 1 && v !== 0).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
    return `/admin/submissions${qs.length ? `?${qs.join("&")}` : ""}`;
  };
  const configured = isSalesforceConfigured();

  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>Submissions</h1>
      <p style={{ color: "var(--grey-5)", marginBottom: 16 }}>
        Contact, enquiry, career and newsletter submissions stored by the website.{" "}
        {configured ? "Each is mirrored to Salesforce as a Lead." : "Salesforce sync is not configured yet, so submissions stay “pending”."}
      </p>

      {!error && (
        <>
          <form action="/admin/submissions" style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <input type="search" name="q" defaultValue={q} placeholder="Search name, email, subject, message" aria-label="Search submissions" style={{ maxWidth: 340 }} />
            {type && <input type="hidden" name="type" value={type} />}
            {sync && <input type="hidden" name="sync" value={sync} />}
            <button className="btn btn-dark" type="submit">Search</button>
          </form>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            <Link className={`btn ${!type ? "btn-dark" : ""}`} href={href({ type: "" })}>All types</Link>
            {SUBMISSION_TYPES.map((t) => <Link key={t} className={`btn ${type === t ? "btn-dark" : ""}`} href={href({ type: t })}>{TYPE_LABELS[t]}</Link>)}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            <Link className={`btn ${!sync ? "btn-dark" : ""}`} href={href({ sync: "" })}>Any sync state</Link>
            {SYNC_STATES.map((s) => <Link key={s} className={`btn ${sync === s ? "btn-dark" : ""}`} href={href({ sync: s })}>{s}</Link>)}
          </div>
        </>
      )}

      {error ? (
        <div className="card">Database not connected, or the Phase C migration (<code>db/migrations/003-submissions.sql</code>) has not been applied.</div>
      ) : rows.length === 0 ? (
        <div className="card">No submissions match. New public form submissions will appear here.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                {["Received", "Type", "Contact", "Message", "Sync", ""].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: ".72rem", color: "var(--grey-5)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.id} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{new Date(x.created_at).toLocaleString("en-GB")}</td>
                  <td style={{ padding: "12px 16px" }}>{TYPE_LABELS[x.type] ?? x.type}{x.has_cv ? " · CV" : ""}</td>
                  <td style={{ padding: "12px 16px" }}><strong>{x.name}</strong><br />{x.email}{x.phone && <><br />{x.phone}</>}</td>
                  <td style={{ padding: "12px 16px", maxWidth: 360 }}>
                    {x.subject && <strong>{x.subject}<br /></strong>}
                    {(x.message ?? "—").slice(0, 140)}{(x.message?.length ?? 0) > 140 ? "…" : ""}
                  </td>
                  <td style={{ padding: "12px 16px" }}><span className={`status-pill status-${x.sf_sync_status === "synced" ? "published" : x.sf_sync_status === "failed" ? "in_review" : "draft"}`}>{x.sf_sync_status}</span></td>
                  <td style={{ padding: "12px 16px" }}><Link href={`/admin/submissions/${x.id}`} style={{ fontWeight: 700, textDecoration: "underline" }}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <p style={{ marginTop: 16, display: "flex", gap: 14, alignItems: "center" }}>
          {page > 1 && <Link href={href({ page: page - 1 })}>← Newer</Link>}
          <span style={{ color: "var(--grey-5)" }}>Page {page} of {pages} · {total} total</span>
          {page < pages && <Link href={href({ page: page + 1 })}>Older →</Link>}
        </p>
      )}
    </>
  );
}

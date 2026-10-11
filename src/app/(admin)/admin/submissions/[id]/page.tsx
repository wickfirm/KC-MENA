import Link from "next/link";
import { queryOne } from "@/lib/db";
import { isSalesforceConfigured } from "@/lib/salesforce";
import type { CvMeta } from "@/lib/submissions";
import RetrySyncButton from "./RetrySyncButton";

export const dynamic = "force-dynamic";

type Detail = {
  id: number;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  meta: { source?: string; jobId?: number | null; cv?: CvMeta | null; cvError?: string | null; cvName?: string | null } | null;
  sf_sync_status: string;
  sf_record_id: string | null;
  sf_synced_at: string | null;
  sf_error: string | null;
  created_at: string;
  job_title: string | null;
};

const label: React.CSSProperties = { fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--grey-5)", marginBottom: 4 };

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  let row: Detail | null = null;
  let dbError = false;
  if (Number.isInteger(id)) {
    try {
      row = await queryOne<Detail>(
        `SELECT s.id, s.type, s.name, s.email, s.phone, s.subject, s.message, s.meta, s.sf_sync_status, s.sf_record_id,
                s.sf_synced_at, s.sf_error, s.created_at, j.title AS job_title
         FROM contact_submissions s
         LEFT JOIN job_openings j ON j.id = NULLIF(s.meta->>'jobId','')::int
         WHERE s.id = $1`,
        [id]
      );
    } catch {
      dbError = true;
    }
  }
  const configured = isSalesforceConfigured();
  const cv = row?.meta?.cv;

  return (
    <>
      <p style={{ marginBottom: 12 }}><Link href="/admin/submissions" style={{ textDecoration: "underline" }}>← All submissions</Link></p>
      {dbError ? (
        <div className="card">Database not connected, or the Phase C migration has not been applied.</div>
      ) : !row ? (
        <div className="card">Submission not found.</div>
      ) : (
        <div style={{ display: "grid", gap: 16, maxWidth: 820 }}>
          <h1 style={{ fontSize: "1.6rem" }}>{row.subject || `${row.type} submission`}</h1>

          <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div><p style={label}>Name</p>{row.name}</div>
            <div><p style={label}>Email</p><a href={`mailto:${row.email}`} style={{ textDecoration: "underline" }}>{row.email}</a></div>
            <div><p style={label}>Phone</p>{row.phone ?? "—"}</div>
            <div><p style={label}>Type</p>{row.type}</div>
            <div><p style={label}>Received</p>{new Date(row.created_at).toLocaleString("en-GB")}</div>
            <div><p style={label}>Source</p>{row.meta?.source ?? "—"}</div>
            {row.meta?.jobId ? (
              <div><p style={label}>Job opening</p>{row.job_title ? <Link href={`/admin/jobs/${row.meta.jobId}`} style={{ textDecoration: "underline" }}>{row.job_title}</Link> : `#${row.meta.jobId} (removed)`}</div>
            ) : null}
          </div>

          <div className="card">
            <p style={label}>Message</p>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{row.message ?? "—"}</div>
          </div>

          {(cv || row.meta?.cvError || row.meta?.cvName) && (
            <div className="card">
              <p style={label}>CV</p>
              {cv ? (
                <a className="btn" href={`/api/submissions/${row.id}/cv`}>Download {cv.name} ({Math.max(1, Math.round(cv.size / 1024))} KB)</a>
              ) : (
                <p>
                  The applicant attached “{row.meta?.cvName ?? "a CV"}” but it could not be stored. Ask them to resend it by email.
                </p>
              )}
            </div>
          )}

          <div className="card">
            <p style={label}>Salesforce</p>
            <p>
              <span className={`status-pill status-${row.sf_sync_status === "synced" ? "published" : row.sf_sync_status === "failed" ? "in_review" : "draft"}`}>{row.sf_sync_status}</span>
              {row.sf_record_id && <> · Lead <code>{row.sf_record_id}</code></>}
              {row.sf_synced_at && <> · {new Date(row.sf_synced_at).toLocaleString("en-GB")}</>}
            </p>
            {row.sf_error && <p className="error-msg">{row.sf_error}</p>}
            {!configured && row.sf_sync_status !== "synced" && (
              <p style={{ color: "var(--grey-5)", marginTop: 8 }}>Salesforce credentials are not configured, so this enquiry is stored locally only.</p>
            )}
            {configured && row.sf_sync_status !== "synced" && <RetrySyncButton id={row.id} />}
          </div>
        </div>
      )}
    </>
  );
}

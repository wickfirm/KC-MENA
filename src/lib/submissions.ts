import { query } from "@/lib/db";
import { isSalesforceConfigured, pushLeadToSalesforce } from "@/lib/salesforce";

export const SUBMISSION_TYPES = ["contact", "enquiry", "career", "newsletter"] as const;
export type SubmissionType = (typeof SUBMISSION_TYPES)[number];

export const SYNC_STATES = ["pending", "synced", "failed"] as const;

/** Applicant CV limits. Kept under the serverless request-body limit (~4.5 MB). */
export const CV_MAX_BYTES = 4 * 1024 * 1024;
const CV_EXTENSIONS = [".pdf", ".doc", ".docx"];
const CV_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export type CvMeta = { key: string; name: string; size: number; type: string };

/** Returns a user-facing problem, or null when the file is acceptable. */
export function cvProblem(file: { name: string; size: number; type: string }): string | null {
  if (file.size <= 0) return "The CV file is empty.";
  if (file.size > CV_MAX_BYTES) return "Your CV is larger than 4 MB. Please upload a smaller file.";
  const lower = file.name.toLowerCase();
  if (!CV_EXTENSIONS.some((ext) => lower.endsWith(ext))) return "Please upload your CV as a PDF or Word document.";
  if (file.type && !CV_MIME.has(file.type)) return "Please upload your CV as a PDF or Word document.";
  return null;
}

/** Safe, unguessable object key: cv/<yyyy>/<mm>/<uuid>-<sanitised name>. */
export function cvObjectKey(name: string, uuid: string, now = new Date()): string {
  const safe = name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").replace(/\.{2,}/g, ".").replace(/-+/g, "-").replace(/^[-.]+/, "").slice(-80);
  return `cv/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${uuid}-${safe || "cv"}`;
}

type SubmissionRow = {
  id: number;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  meta: { source?: string } | null;
};

/**
 * Mirror one stored submission to Salesforce and record the outcome on the row.
 * Never throws. Returns "synced" | "failed" | "skipped" (credentials not configured —
 * the row stays `pending` without an error).
 */
export async function syncSubmission(id: number): Promise<"synced" | "failed" | "skipped"> {
  if (!isSalesforceConfigured()) return "skipped";
  try {
    const rows = await query<SubmissionRow>(
      "SELECT id, type, name, email, phone, subject, message, meta FROM contact_submissions WHERE id = $1",
      [id]
    );
    const row = rows[0];
    if (!row) return "failed";
    try {
      const sfId = await pushLeadToSalesforce({
        name: row.name,
        email: row.email,
        phone: row.phone,
        type: row.type,
        subject: row.subject,
        message: row.message,
        source: row.meta?.source ?? null,
      });
      await query(
        "UPDATE contact_submissions SET sf_sync_status = 'synced', sf_record_id = $2, sf_synced_at = now(), sf_error = NULL WHERE id = $1",
        [id, sfId]
      );
      return "synced";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Salesforce sync failed";
      await query("UPDATE contact_submissions SET sf_sync_status = 'failed', sf_error = $2 WHERE id = $1", [id, message.slice(0, 500)]);
      return "failed";
    }
  } catch (error) {
    console.error("[submissions] sync bookkeeping failed:", error);
    return "failed";
  }
}

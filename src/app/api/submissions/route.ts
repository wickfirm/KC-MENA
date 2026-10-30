import { NextRequest, NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";
import { putObject, cvBucket } from "@/lib/r2";
import { SUBMISSION_TYPES, cvObjectKey, cvProblem, syncSubmission, type CvMeta } from "@/lib/submissions";
import { sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";

type Submission = { type?: string; name?: string; email?: string; phone?: string; subject?: string; message?: string; source?: string; jobId?: number | string; recipientEmail?: string; delivery?: string };

/**
 * POST /api/submissions — public form endpoint. Accepts JSON, or multipart/form-data when an
 * applicant attaches a CV (field `cv`). The enquiry is ALWAYS stored locally first; the
 * Salesforce mirror runs after the response so the visitor never waits on it.
 */
export async function POST(req: NextRequest) {
  let body: Submission;
  let cv: File | null = null;
  try {
    if ((req.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      const form = await req.formData();
      body = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) as Submission;
      const file = form.get("cv");
      cv = file instanceof File && file.size > 0 ? file : null;
    } else {
      body = await req.json();
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Please provide a name and valid email address." }, { status: 400 });
  }
  const type = (SUBMISSION_TYPES as readonly string[]).includes(body.type ?? "") ? body.type! : "contact";
  const delivery = body.delivery === "email" || body.delivery === "inbox" ? body.delivery : "both";
  const recipient = body.recipientEmail?.trim() || "";

  if (cv) {
    const problem = cvProblem(cv);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  }

  // Store the CV first (best-effort): a storage hiccup must not lose the application itself.
  let cvMeta: CvMeta | null = null;
  let cvError: string | null = null;
  if (cv) {
    try {
      const key = cvObjectKey(cv.name, randomUUID());
      await putObject(cvBucket(), key, new Uint8Array(await cv.arrayBuffer()), cv.type || "application/octet-stream");
      cvMeta = { key, name: cv.name.slice(0, 200), size: cv.size, type: cv.type };
    } catch (error) {
      console.error("POST /api/submissions CV upload failed:", error);
      cvError = "CV could not be stored";
    }
  }

  let id: number | undefined;
  if (delivery !== "email") {
  try {
    const rows = await query<{ id: number }>(
      `INSERT INTO contact_submissions (type,name,email,phone,subject,message,meta)
       VALUES ($1,$2,$3,$4,$5,$6,$7::text::jsonb) RETURNING id`,
      [
        type, name, email, body.phone?.trim() || null, body.subject?.trim() || null, body.message?.trim() || null,
        JSON.stringify({ source: body.source ?? "website", jobId: body.jobId ? Number(body.jobId) || null : null, cv: cvMeta, cvError, cvName: cv?.name ?? null }),
      ]
    );
    id = rows[0]?.id;
    if (id) after(() => syncSubmission(id!));
  } catch (err) {
    console.error("POST /api/submissions error:", err);
    if (delivery === "inbox") return NextResponse.json({ error: "We could not send your enquiry. Please try again." }, { status: 500 });
  }
  }

  let mailed = false;
  if (delivery !== "inbox") {
    if (!recipient) {
      if (id) return NextResponse.json({ ok: true, id }, { status: 201 });
      return NextResponse.json({ error: "This form has no recipient email address." }, { status: 400 });
    }
    const problem = await sendMail({
      to: recipient,
      subject: body.subject?.trim() || "Website enquiry",
      text: [`Name: ${name}`, `Email: ${email}`, body.phone?.trim() ? `Phone: ${body.phone.trim()}` : "", "", body.message?.trim() || ""].filter(Boolean).join("\n"),
    });
    mailed = !problem;
    if (problem && !id) return NextResponse.json({ error: problem }, { status: 502 });
  }

  if (!id && !mailed) return NextResponse.json({ error: "We could not send your enquiry. Please try again." }, { status: 500 });
  return NextResponse.json({ ok: true, id }, { status: 201 });
}

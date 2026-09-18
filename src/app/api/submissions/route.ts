import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type Submission = { type?: string; name?: string; email?: string; phone?: string; subject?: string; message?: string; source?: string; jobId?: number };

export async function POST(req: NextRequest) {
  let body: Submission;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
  const name = body.name?.trim(); const email = body.email?.trim().toLowerCase();
  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Please provide a name and valid email address." }, { status: 400 });
  const type = ["contact", "enquiry", "career", "newsletter"].includes(body.type ?? "") ? body.type! : "contact";
  try {
    const rows = await query(
      `INSERT INTO contact_submissions (type,name,email,phone,subject,message,meta)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb) RETURNING id`,
      [type, name, email, body.phone?.trim() || null, body.subject?.trim() || null, body.message?.trim() || null,
       JSON.stringify({ source: body.source ?? "website", jobId: body.jobId ?? null })]
    );
    return NextResponse.json({ ok: true, id: rows[0]?.id }, { status: 201 });
  } catch (err) { console.error("POST /api/submissions error:", err); return NextResponse.json({ error: "We could not send your enquiry. Please try again." }, { status: 500 }); }
}

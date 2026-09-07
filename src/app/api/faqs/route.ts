import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export type FaqPayload = {
  question?: string;
  answer?: string;
  category?: string | null;
  sort_order?: number;
  is_published?: boolean;
};

/** GET /api/faqs — list all FAQs (admin only) */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await query("SELECT * FROM faqs ORDER BY sort_order ASC, id ASC");
  return NextResponse.json({ faqs: rows });
}

/** POST /api/faqs — create (admin only) */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let p: FaqPayload;
  try {
    p = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!p.question?.trim() || !p.answer?.trim()) {
    return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
  }

  try {
    const rows = await query(
      `INSERT INTO faqs (question, answer, category, sort_order, is_published)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        p.question.trim(),
        p.answer.trim(),
        p.category || null,
        Number.isFinite(p.sort_order) ? p.sort_order! : 0,
        p.is_published ?? true,
      ]
    );
    return NextResponse.json({ faq: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/faqs error:", err);
    return NextResponse.json({ error: "Could not save FAQ" }, { status: 500 });
  }
}

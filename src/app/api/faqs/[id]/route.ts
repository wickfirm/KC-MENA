import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import type { FaqPayload } from "../route";

export const dynamic = "force-dynamic";

/** PUT /api/faqs/:id — update (admin only) */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const faqId = Number(id);
  if (!Number.isInteger(faqId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let p: FaqPayload;
  try {
    p = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const rows = await query(
      `UPDATE faqs SET
         question = COALESCE($2, question),
         answer = COALESCE($3, answer),
         category = $4,
         sort_order = COALESCE($5, sort_order),
         is_published = COALESCE($6, is_published),
         updated_at = now()
       WHERE id = $1 RETURNING *`,
      [
        faqId,
        p.question?.trim() ?? null,
        p.answer?.trim() ?? null,
        p.category || null,
        Number.isFinite(p.sort_order) ? p.sort_order! : null,
        typeof p.is_published === "boolean" ? p.is_published : null,
      ]
    );
    if (!rows[0]) return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    return NextResponse.json({ faq: rows[0] });
  } catch (err) {
    console.error("PUT /api/faqs/:id error:", err);
    return NextResponse.json({ error: "Could not update FAQ" }, { status: 500 });
  }
}

/** DELETE /api/faqs/:id — delete (admin only) */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const faqId = Number(id);
  if (!Number.isInteger(faqId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const row = await queryOne("DELETE FROM faqs WHERE id = $1 RETURNING id", [faqId]);
    if (!row) return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/faqs/:id error:", err);
    return NextResponse.json({ error: "Could not delete FAQ" }, { status: 500 });
  }
}

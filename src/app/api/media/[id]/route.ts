import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnlessCan } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { query, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/media/:id — remove the library record (admin only).
 * The R2 object itself is intentionally kept (it may be referenced by
 * published pages); it can be purged from the bucket during content QA.
 */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const denied = denyUnlessCan(session, "media.delete");
  if (denied || !session) return denied!;

  const { id } = await ctx.params;
  const mediaId = Number(id);
  if (!Number.isInteger(mediaId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const row = await queryOne<{ filename: string }>("DELETE FROM media_assets WHERE id = $1 RETURNING filename", [mediaId]);
    if (!row) return NextResponse.json({ error: "Media not found" }, { status: 404 });
    await logActivity({ action: "media.delete", summary: `Deleted media “${row.filename}”`, actor: session, entityType: "media", entityId: mediaId });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/media/:id error:", err);
    return NextResponse.json({ error: "Could not delete media" }, { status: 500 });
  }
}

/** PUT /api/media/:id — update a library item's alt text (any signed-in user). */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const denied = denyUnlessCan(session, "media.upload");
  if (denied || !session) return denied!;

  const mediaId = Number((await ctx.params).id);
  if (!Number.isInteger(mediaId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: { alt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const alt = (body.alt ?? "").trim().slice(0, 300) || null;

  try {
    const rows = await query<{ filename: string }>("UPDATE media_assets SET alt = $2 WHERE id = $1 RETURNING filename", [mediaId, alt]);
    if (!rows[0]) return NextResponse.json({ error: "Media not found" }, { status: 404 });
    await logActivity({ action: "content.save", summary: `Updated alt text for media “${rows[0].filename}”`, actor: session, entityType: "media", entityId: mediaId });
    return NextResponse.json({ ok: true, alt });
  } catch (err) {
    console.error("PUT /api/media/:id error:", err);
    return NextResponse.json({ error: "Could not save alt text" }, { status: 500 });
  }
}

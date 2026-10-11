import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnless } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/media/:id — remove the library record (admin only).
 * The R2 object itself is intentionally kept (it may be referenced by
 * published pages); it can be purged from the bucket during content QA.
 */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const denied = denyUnless(session, ["admin"]);
  if (denied) return denied;

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

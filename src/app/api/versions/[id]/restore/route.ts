import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnlessCan } from "@/lib/auth";
import { query } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { buildRestoreQuery, getVersion, isVersionEntity, recordVersion, versionEntities, restorePermission } from "@/lib/versions";

export const dynamic = "force-dynamic";

/** POST /api/versions/:id/restore — write a stored version back onto its record. */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const versionId = Number((await ctx.params).id);
  if (!Number.isInteger(versionId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const version = await getVersion(versionId);
    if (!version || !isVersionEntity(version.entity_type)) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }
    const config = versionEntities[version.entity_type];
    const denied = denyUnlessCan(session, restorePermission(version.entity_type));
    if (denied) return denied;

    const { text, params } = buildRestoreQuery(version.entity_type, version.entity_id, version.snapshot);
    const rows = await query(text, params);
    if (!rows[0]) return NextResponse.json({ error: "The record no longer exists" }, { status: 404 });

    await recordVersion(version.entity_type, rows[0], session, `Restored version ${version.version_number}`);
    await logActivity({
      action: "content.restore",
      summary: `Restored ${config.noun} (${version.entity_id}) to version ${version.version_number}`,
      actor: session,
      entityType: version.entity_type,
      entityId: version.entity_id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/versions/:id/restore error:", error);
    return NextResponse.json({ error: "Could not restore this version" }, { status: 500 });
  }
}

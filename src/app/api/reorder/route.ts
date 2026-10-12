import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnlessCan } from "@/lib/auth";
import { query } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { assignSortSlots } from "@/lib/reorder";

export const dynamic = "force-dynamic";

const ENTITIES = {
  faq: { table: "faqs", group: "category", noun: "FAQs" },
  project: { table: "projects", group: "sector", noun: "projects" },
} as const;

/**
 * POST /api/reorder — save a new order for the items of one group (the FAQs of a category, the projects of a
 * sector). Body: { entity: "faq" | "project", ids: number[] } in the desired order. The group's existing
 * sort values are re-used, so its position relative to other groups on the public site does not change.
 * Changing the live order needs the publish permission.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  const denied = denyUnlessCan(session, "content.publish");
  if (denied || !session) return denied!;

  let body: { entity?: string; ids?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const config = body.entity === "faq" || body.entity === "project" ? ENTITIES[body.entity] : null;
  const ids = Array.isArray(body.ids) ? body.ids.map(Number) : [];
  if (!config || ids.length < 2 || ids.length > 500 || ids.some((n) => !Number.isInteger(n)) || new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const rows = await query<{ id: number; sort_order: number; grp: string | null }>(
      `SELECT id, sort_order, ${config.group} AS grp FROM ${config.table} WHERE id = ANY($1::int[])`,
      [ids]
    );
    if (rows.length !== ids.length) return NextResponse.json({ error: "Some items no longer exist. Refresh and try again." }, { status: 409 });
    if (new Set(rows.map((r) => r.grp ?? "")).size > 1) {
      return NextResponse.json({ error: "Items can only be reordered within their own group." }, { status: 400 });
    }

    const slots = assignSortSlots(ids, new Map(rows.map((r) => [r.id, r.sort_order])));
    for (const [id, order] of slots) {
      await query(`UPDATE ${config.table} SET sort_order = $2, updated_at = now() WHERE id = $1`, [id, order]);
    }
    await logActivity({
      action: "content.save",
      summary: `Reordered ${ids.length} ${config.noun}${rows[0].grp ? ` (${rows[0].grp})` : ""}`,
      actor: session,
      entityType: body.entity,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/reorder error:", error);
    return NextResponse.json({ error: "Could not save the new order" }, { status: 500 });
  }
}

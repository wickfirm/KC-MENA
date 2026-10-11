import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnlessCan } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { isSalesforceConfigured } from "@/lib/salesforce";
import { syncSubmission } from "@/lib/submissions";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** POST /api/submissions/:id/retry — replay the Salesforce sync for a stored enquiry. */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const denied = denyUnlessCan(session, "messages.manage");
  if (denied || !session) return denied!;

  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  if (!isSalesforceConfigured()) {
    return NextResponse.json({ error: "Salesforce credentials are not configured yet." }, { status: 400 });
  }

  try {
    const row = await queryOne<{ email: string; sf_sync_status: string }>(
      "SELECT email, sf_sync_status FROM contact_submissions WHERE id = $1",
      [id]
    );
    if (!row) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    if (row.sf_sync_status === "synced") return NextResponse.json({ error: "Already synced" }, { status: 400 });

    const outcome = await syncSubmission(id);
    await logActivity({
      action: "submission.retry",
      summary: outcome === "synced" ? `Synced enquiry from ${row.email} to Salesforce` : `Salesforce retry failed for ${row.email}`,
      actor: session,
      entityType: "submission",
      entityId: id,
    });
    if (outcome !== "synced") {
      const failed = await queryOne<{ sf_error: string | null }>("SELECT sf_error FROM contact_submissions WHERE id = $1", [id]);
      return NextResponse.json({ error: failed?.sf_error ?? "Salesforce sync failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/submissions/:id/retry error:", error);
    return NextResponse.json({ error: "Could not retry the sync" }, { status: 500 });
  }
}

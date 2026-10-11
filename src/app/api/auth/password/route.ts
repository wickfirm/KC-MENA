import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword, verifyCredentials } from "@/lib/auth";
import { query } from "@/lib/db";
import { passwordProblem } from "@/lib/password-rules";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/password — change the signed-in user's password.
 * Body: { current, next } — requires the current password to match.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { current?: string; next?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const current = body.current ?? "";
  const next = body.next ?? "";

  const problem = passwordProblem(next);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const user = await verifyCredentials(session.email, current);
  if (!user) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  try {
    await query("UPDATE users SET password_hash = $2, password_changed_at = now() WHERE id = $1", [session.id, await hashPassword(next)]);
    await logActivity({ action: "user.password", summary: `${session.name || session.email} changed their own password`, actor: session, entityType: "user", entityId: session.id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/password error:", err);
    return NextResponse.json({ error: "Could not update password" }, { status: 500 });
  }
}

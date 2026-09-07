import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword, verifyCredentials } from "@/lib/auth";
import { query } from "@/lib/db";

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

  if (next.length < 10) {
    return NextResponse.json({ error: "New password must be at least 10 characters" }, { status: 400 });
  }
  if (!/[A-Za-z]/.test(next) || !/[0-9]/.test(next)) {
    return NextResponse.json({ error: "New password must contain letters and numbers" }, { status: 400 });
  }

  const user = await verifyCredentials(session.email, current);
  if (!user) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  try {
    await query("UPDATE users SET password_hash = $2 WHERE id = $1", [session.id, await hashPassword(next)]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/password error:", err);
    return NextResponse.json({ error: "Could not update password" }, { status: 500 });
  }
}

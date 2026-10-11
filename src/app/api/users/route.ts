import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnless, hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { passwordProblem } from "@/lib/password-rules";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** GET /api/users — team list (admin only) */
export async function GET() {
  const session = await getSession();
  const denied = denyUnless(session, ["admin"]);
  if (denied) return denied;
  try {
    const users = await query(
      "SELECT id, email, name, role, is_active, last_login_at, created_at FROM users ORDER BY created_at ASC"
    );
    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Could not load users" }, { status: 500 });
  }
}

/** POST /api/users — create an account (admin only). Body: { name, email, password, role } */
export async function POST(req: NextRequest) {
  const session = await getSession();
  const denied = denyUnless(session, ["admin"]);
  if (denied) return denied;

  let body: { name?: string; email?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const role = body.role === "admin" ? "admin" : "editor";
  if (!name) return NextResponse.json({ error: "Enter the person's name" }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  const problem = passwordProblem(body.password ?? "");
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  try {
    const rows = await query<{ id: number }>(
      `INSERT INTO users (email, password_hash, name, role, password_changed_at)
       VALUES ($1, $2, $3, $4, now()) RETURNING id, email, name, role, is_active, created_at`,
      [email, await hashPassword(body.password!), name, role]
    );
    await logActivity({
      action: "user.create",
      summary: `Created ${role} account for ${name} (${email})`,
      actor: session,
      entityType: "user",
      entityId: rows[0].id,
    });
    return NextResponse.json({ user: rows[0] }, { status: 201 });
  } catch (error) {
    const duplicate = String((error as { code?: string }).code) === "23505";
    if (!duplicate) console.error("POST /api/users error:", error);
    return NextResponse.json(
      { error: duplicate ? "That email already has an account" : "Could not create the account" },
      { status: duplicate ? 409 : 500 }
    );
  }
}

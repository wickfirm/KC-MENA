import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnless, hashPassword } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { passwordProblem } from "@/lib/password-rules";

export const dynamic = "force-dynamic";

type Target = { id: number; email: string; name: string; role: string; is_active: boolean };

async function activeAdminCount(): Promise<number> {
  const row = await queryOne<{ n: number }>("SELECT count(*)::int AS n FROM users WHERE role = 'admin' AND is_active");
  return row?.n ?? 0;
}

/**
 * PUT /api/users/:id — change role, activate/deactivate, or reset password (admin only).
 * Body: any of { role, is_active, password }. Guards: at least one active admin must remain;
 * you cannot deactivate your own account.
 */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const denied = denyUnless(session, ["admin"]);
  if (denied) return denied;

  const userId = Number((await ctx.params).id);
  if (!Number.isInteger(userId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: { role?: string; is_active?: boolean; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const target = await queryOne<Target>("SELECT id, email, name, role, is_active FROM users WHERE id = $1", [userId]);
    if (!target) return NextResponse.json({ error: "That account no longer exists" }, { status: 404 });

    const removesAdmin = target.role === "admin" && target.is_active;

    // Validate everything before writing anything.
    const role = body.role === undefined ? undefined : body.role === "admin" ? "admin" : "editor";
    const active = body.is_active === undefined ? undefined : Boolean(body.is_active);
    const problem = body.password === undefined ? null : passwordProblem(body.password);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    if (role === "editor" && removesAdmin && (await activeAdminCount()) <= 1) {
      return NextResponse.json({ error: "You need at least one active administrator. Promote someone else first." }, { status: 400 });
    }
    if (active === false) {
      if (userId === session!.id) {
        return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
      }
      if (removesAdmin && (await activeAdminCount()) <= 1) {
        return NextResponse.json({ error: "You need at least one active administrator" }, { status: 400 });
      }
    }

    const who = target.name || target.email;
    if (body.password !== undefined) {
      await query("UPDATE users SET password_hash = $2, password_changed_at = now() WHERE id = $1", [
        userId,
        await hashPassword(body.password),
      ]);
      await logActivity({ action: "user.password", summary: `Reset the password for ${who}`, actor: session, entityType: "user", entityId: userId });
    }
    if (role !== undefined) {
      await query("UPDATE users SET role = $2 WHERE id = $1", [userId, role]);
      await logActivity({ action: "user.update", summary: `Changed ${who}'s role to ${role}`, actor: session, entityType: "user", entityId: userId });
    }
    if (active !== undefined) {
      await query("UPDATE users SET is_active = $2 WHERE id = $1", [userId, active]);
      await logActivity({ action: "user.update", summary: `${active ? "Reactivated" : "Deactivated"} ${who}`, actor: session, entityType: "user", entityId: userId });
    }

    const user = await queryOne("SELECT id, email, name, role, is_active, last_login_at, created_at FROM users WHERE id = $1", [userId]);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("PUT /api/users/:id error:", error);
    return NextResponse.json({ error: "Could not update the account" }, { status: 500 });
  }
}

/** DELETE /api/users/:id — delete an account (admin only). Not yourself; not the last active admin. */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const denied = denyUnless(session, ["admin"]);
  if (denied) return denied;

  const userId = Number((await ctx.params).id);
  if (!Number.isInteger(userId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  if (userId === session!.id) return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });

  try {
    const target = await queryOne<Target>("SELECT id, email, name, role, is_active FROM users WHERE id = $1", [userId]);
    if (!target) return NextResponse.json({ error: "That account no longer exists" }, { status: 404 });
    if (target.role === "admin" && target.is_active && (await activeAdminCount()) <= 1) {
      return NextResponse.json({ error: "You need at least one active administrator" }, { status: 400 });
    }
    await query("DELETE FROM users WHERE id = $1", [userId]);
    await logActivity({ action: "user.delete", summary: `Deleted ${target.name || target.email}'s account (${target.email})`, actor: session, entityType: "user", entityId: userId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    // 23503: the account still owns rows (updated_by / created_by) — deactivate instead.
    const referenced = String((error as { code?: string }).code) === "23503";
    if (!referenced) console.error("DELETE /api/users/:id error:", error);
    return NextResponse.json(
      { error: referenced ? "This account has authored content and cannot be deleted. Deactivate it instead." : "Could not delete the account" },
      { status: referenced ? 409 : 500 }
    );
  }
}

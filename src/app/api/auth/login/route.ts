import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  verifyCredentials,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";
import { query } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  let user;
  try {
    user = await verifyCredentials(email, password);
  } catch (err) {
    console.error("Login DB error:", err);
    return NextResponse.json(
      { error: "Service unavailable — check DATABASE_URL configuration" },
      { status: 503 }
    );
  }
  if (!user) {
    await logActivity({ action: "auth.login_failed", summary: `Failed sign-in for ${email}`, metadata: { email } });
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  await query("UPDATE users SET last_login_at = now() WHERE id = $1", [user.id]).catch(() => undefined);
  await logActivity({ action: "auth.login", summary: `${user.name || user.email} signed in`, actor: user, entityType: "user", entityId: user.id });

  const token = await createSessionToken(user);
  const res = NextResponse.json({ user });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}

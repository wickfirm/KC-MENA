import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";

const COOKIE_NAME = "kc_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "editor";
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET env var is missing or too short (min 16 chars).");
  }
  return new TextEncoder().encode(secret);
}

/** Sign a session JWT for the given user. */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

/** Verify a JWT and return the session user, or null. Edge-safe. */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.id !== "number" || typeof payload.email !== "string") return null;
    return {
      id: payload.id,
      email: payload.email,
      name: (payload.name as string) ?? "",
      role: (payload.role as SessionUser["role"]) ?? "editor",
    };
  } catch {
    return null;
  }
}

/**
 * Read the session from the request cookie (server components / route handlers).
 *
 * The signed cookie alone cannot tell whether the account was deactivated,
 * deleted or re-roled after sign-in, so the users row is re-checked here and
 * the role/name come from the database, not the token. If the database is
 * unreachable the token is trusted (the admin UI then shows its own
 * "Database not connected" states; mutations fail on their own).
 */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const claims = await verifySessionToken(token);
  if (!claims) return null;
  try {
    const row = await queryOne<{ id: number; email: string; name: string; role: string; is_active: boolean }>(
      "SELECT id, email, name, role, is_active FROM users WHERE id = $1",
      [claims.id]
    );
    if (!row || !row.is_active) return null;
    return { id: row.id, email: row.email, name: row.name, role: row.role === "admin" ? "admin" : "editor" };
  } catch (error) {
    console.error("[auth] live session check failed, trusting token:", error);
    return claims;
  }
}

/**
 * Role guard for route handlers. Returns the 401/403 response to send, or null
 * when the session may proceed.
 *   admin  — everything: content, media, settings, users, activity log.
 *   editor — content, media uploads, submissions and RSS review; no settings,
 *            no user management, no activity log, no media deletion.
 */
export function denyUnless(session: SessionUser | null, roles: SessionUser["role"][]): NextResponse | null {
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!roles.includes(session.role)) {
    return NextResponse.json({ error: "You do not have permission to do that" }, { status: 403 });
  }
  return null;
}

/** Server-component guard for admin-only screens. Editors are sent back to the dashboard. */
export async function requireAdminPage(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "admin") redirect("/admin?denied=1");
  return session;
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

/** Validate credentials against the users table. Returns user or null. */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const row = await queryOne<{
    id: number;
    email: string;
    name: string;
    role: string;
    password_hash: string;
    is_active: boolean;
  }>("SELECT id, email, name, role, password_hash, is_active FROM users WHERE email = $1", [email]);
  if (!row || !row.is_active) return null;
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role === "admin" ? "admin" : "editor",
  };
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

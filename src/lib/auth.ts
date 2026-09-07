import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
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

/** Read the session from the request cookie (server components / route handlers). */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
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
  }>("SELECT id, email, name, role, password_hash FROM users WHERE email = $1", [email]);
  if (!row) return null;
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

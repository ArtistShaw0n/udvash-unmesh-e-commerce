/**
 * Server-side auth helpers — JWT session in HTTP-only cookie.
 *
 * - Passwords: bcryptjs (10 rounds)
 * - Sessions: JWT signed with HS256 via `jose`
 * - Cookie: `udvash_session`, HTTP-only, secure in prod, SameSite=Lax
 *
 * In prod set AUTH_SECRET env var. Locally falls back to a static dev key
 * so the app starts without configuration.
 */

import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { store, type ServerUser } from "./store";

const SESSION_COOKIE = "udvash_session";
const SESSION_DAYS = 30;

function secretKey(): Uint8Array {
  const raw =
    process.env.AUTH_SECRET ?? "dev-only-not-secure-replace-in-production-please";
  return new TextEncoder().encode(raw);
}

export interface SessionClaims {
  sub: string;       // user id
  email: string;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: ServerUser): Promise<string> {
  const jwt = await new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return jwt;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionClaims;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionClaims> {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHORIZED");
  return s;
}

/**
 * Resolve the current user (or null) from the session cookie.
 */
export async function getCurrentUser(): Promise<ServerUser | null> {
  const s = await getSession();
  if (!s?.sub) return null;
  return store.findUserById(s.sub) ?? null;
}

// --------------------------------------------------------------------
// Admin role
// --------------------------------------------------------------------

/**
 * Admin emails — comma-separated list in ADMIN_EMAILS env var.
 * Defaults to demo emails so the admin panel is reachable out of the box.
 */
function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "admin@udvash.com,super@udvash.com";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return adminEmails().includes(email.trim().toLowerCase());
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const u = await getCurrentUser();
  return !!u && isAdminEmail(u.email);
}

/**
 * Resolve the current user, requiring admin. Throws if not.
 */
export async function requireAdmin(): Promise<ServerUser> {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHORIZED");
  if (!isAdminEmail(u.email)) throw new Error("FORBIDDEN");
  return u;
}

/**
 * Login session without a member database (project brief: no membership system, keep personal data
 * to a minimum). The cookie holds only a one-way hash of the LINE userId, a demo flag and an expiry,
 * signed with HMAC-SHA256. Uses Web Crypto so it runs in middleware (edge) and route handlers.
 */
export const SESSION_COOKIE = "fl_session";
export const SESSION_DAYS = 7;

export type Session = { sub: string; demo: boolean; exp: number };

const enc = new TextEncoder();

function secret(): string {
  const s = process.env.SESSION_SECRET?.trim();
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is not set");
  return "finlens-dev-only-secret";
}

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmac(data: string, key = secret()): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", k, enc.encode(data));
}

/** One-way hash of a LINE userId (rule 6: never store the raw id). */
export async function hashUserId(userId: string): Promise<string> {
  return b64url(await hmac(`line-user:${userId}`)).slice(0, 32);
}

export async function signSession(s: Omit<Session, "exp">, now = Date.now()): Promise<string> {
  const payload: Session = { ...s, exp: Math.floor(now / 1000) + SESSION_DAYS * 24 * 3600 };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  return `${body}.${b64url(await hmac(body))}`;
}

/** The session if the cookie is genuine and not expired, else null. */
export async function verifySession(token: string | undefined | null, now = Date.now()): Promise<Session | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = b64url(await hmac(body));
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return null;
  try {
    const s = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Session;
    if (typeof s.exp !== "number" || s.exp * 1000 < now || typeof s.sub !== "string") return null;
    return s;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 24 * 3600,
};

/** Demo login is only allowed while LINE Login (LIFF) is not configured. */
export function demoLoginAllowed(): boolean {
  return !process.env.NEXT_PUBLIC_LIFF_ID?.trim();
}

/** Only same-site paths are allowed as a post-login destination. */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/funds";
}

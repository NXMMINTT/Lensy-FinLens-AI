import liff from "@line/liff";

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID?.trim();
// Canonical app origin registered as the LINE Login Callback URL + backend CORS origin.
// Pinning login redirects here means preview deployments (different origins) still work.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim();

let initPromise: Promise<void> | null = null;

export function isLiffConfigured(): boolean {
  return Boolean(LIFF_ID);
}

/** Initializes LIFF once per page load. No-ops outside a LIFF-configured deploy (e.g. local dev). */
export function initLiff(): Promise<void> {
  if (!LIFF_ID) {
    return Promise.resolve();
  }
  if (!initPromise) {
    initPromise = liff.init({ liffId: LIFF_ID });
  }
  return initPromise;
}

/**
 * redirectUri must exactly match a Callback URL registered on the LINE Login channel: the canonical
 * site origin (so preview URLs work too), never a sub-path (that gives "400 Bad Request").
 */
function loginRedirectUri(): string {
  return SITE_URL || window.location.origin;
}

/* ── Web login (/login page) ──
 * LINE only sends the user back to the exact registered Callback URL (the site root): a sub-path
 * such as /login?next=… gets "400 Bad Request". So the page we want to land on is kept in
 * sessionStorage, LINE returns to the root, and LiffStateHandler finishes the login there. */

const PENDING_KEY = "finlens.login.next";

/** Only same-site paths ("/x", not "//host" or "https://…"). */
function safePath(p: string | null | undefined): string | null {
  return p && p.startsWith("/") && !p.startsWith("//") && !p.startsWith("/\\") ? p : null;
}

/* A browser that logged in before the openid scope was added keeps that old token: liff.isLoggedIn()
 * is true but liff.getIDToken() is null. We log out of LINE and log in again for a token with the
 * new scope, at most once per tab session (RELOGIN_KEY), so a token that never comes cannot loop. */
export const RELOGIN_KEY = "finlens.login.relogin";
export const NO_ID_TOKEN = "ไม่ได้รับข้อมูลยืนยันตัวตนจาก LINE กด \"ลองใหม่\" เพื่อเข้าสู่ระบบอีกครั้งนะคะ";
/** Shown when even a fresh login has no openid scope: a LINE Developers setting, not an old token. */
export const NO_OPENID_SCOPE = "LINE ไม่ได้ส่งข้อมูลยืนยันตัวตนมา เพราะแอป LIFF ยังไม่ได้เปิดสิทธิ์ openid กรุณาแจ้งทีม FinLens ค่ะ";

/** The scopes LINE granted to the current token, or null when unknown. */
function grantedScopes(): string[] | null {
  try {
    return liff.getContext()?.scope ?? null;
  } catch {
    return null;
  }
}

/**
 * Re-login to get an ID token. Returns true when the page is leaving (to LINE Login, or reloading
 * inside the LINE app), false when it was already tried in this tab.
 */
export function reloginForIdToken(next?: string): boolean {
  try {
    if (sessionStorage.getItem(RELOGIN_KEY)) return false;
    sessionStorage.setItem(RELOGIN_KEY, "1");
    sessionStorage.setItem(PENDING_KEY, safePath(next) ?? safePath(window.location.pathname + window.location.search) ?? "/funds");
  } catch {
    return false; // can't remember the attempt, so don't risk a loop
  }
  try {
    liff.logout();
  } catch {
    /* ignore */
  }
  if (liff.isInClient()) {
    // liff.login() does nothing inside the LINE app; liff.init() logs in again on reload
    window.location.reload();
  } else {
    liff.login({ redirectUri: loginRedirectUri() });
  }
  return true;
}

/** "ลองใหม่" after a failed attempt: allow one more re-login. */
export function resetRelogin(): void {
  try {
    sessionStorage.removeItem(RELOGIN_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Exchanges the LINE ID token for our own session cookie (POST /api/auth/line).
 * "redirecting" = no ID token, so it went back to LINE Login for the new scope; the caller stops.
 */
export async function exchangeLineToken(next?: string): Promise<"ok" | "redirecting"> {
  const idToken = liff.getIDToken();
  if (!idToken) {
    if (reloginForIdToken(next)) return "redirecting";
    // already re-logged in once: tell an old token apart from a LIFF app without the openid scope
    const scopes = grantedScopes();
    if (scopes && !scopes.includes("openid")) {
      console.warn("[liff] the LIFF app has no openid scope (LINE Developers > LIFF > Scopes). Granted:", scopes.join(", "));
      throw new Error(NO_OPENID_SCOPE);
    }
    throw new Error(NO_ID_TOKEN);
  }
  const r = await fetch("/api/auth/line", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
  if (!r.ok) throw new Error(((await r.json().catch(() => null)) as { error?: string } | null)?.error ?? "เข้าสู่ระบบไม่สำเร็จ");
  resetRelogin();
  return "ok";
}

/** Sends the user to LINE Login, remembering where to go afterwards. */
export function startLineLogin(next: string): void {
  try {
    sessionStorage.setItem(PENDING_KEY, safePath(next) ?? "/funds");
  } catch {
    /* storage blocked: they land on the root and can open the menu from there */
  }
  liff.login({ redirectUri: loginRedirectUri() });
}

/** Back from LINE Login at the root: finish the session and go to the remembered page. */
export async function finishPendingLogin(): Promise<void> {
  let next: string | null = null;
  try {
    next = safePath(sessionStorage.getItem(PENDING_KEY));
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    return;
  }
  if (!next || !liff.isLoggedIn()) return;
  try {
    if ((await exchangeLineToken(next)) === "redirecting") return;
    window.location.replace(next);
  } catch {
    window.location.replace(`/login?next=${encodeURIComponent(next)}`);
  }
}

/** Logs the user out of LINE (LIFF) and forgets any login in progress in this tab.
 * Initializes LIFF first: on a page that never called init, liff.logout() would do nothing. */
export async function liffLogout(): Promise<void> {
  try {
    sessionStorage.removeItem(RELOGIN_KEY);
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
  if (!LIFF_ID) return;
  try {
    await initLiff();
    if (liff.isLoggedIn()) liff.logout();
  } catch {
    /* ignore */
  }
}

/** The "ออกจากระบบ" button: clears the site session cookie and logs out of LINE. */
export async function signOut(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  await liffLogout();
}

export type LineProfile = { displayName: string; pictureUrl?: string };

/** The signed-in LINE user's profile, or null outside LIFF / when not logged in. */
export async function getLineProfile(): Promise<LineProfile | null> {
  await initLiff();
  if (!LIFF_ID || !liff.isLoggedIn()) return null;
  try {
    const p = await liff.getProfile();
    return { displayName: p.displayName, pictureUrl: p.pictureUrl };
  } catch {
    return null;
  }
}

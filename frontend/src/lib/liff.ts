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

export async function ensureLoggedIn(): Promise<void> {
  await initLiff();
  if (!LIFF_ID) return;
  // redirectUri must exactly match a Callback URL registered on the LINE Login channel.
  // Use the canonical site origin so login works from preview URLs too, and never a
  // sub-path (which triggers an "invalid url" 400). liff.state deep links still route
  // after login via LiffStateHandler.
  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: SITE_URL || window.location.origin });
  }
}

export async function getIdToken(): Promise<string | null> {
  await ensureLoggedIn();
  if (!LIFF_ID) return null;
  return liff.getIDToken();
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

/** Exchanges the LINE ID token for our own session cookie (POST /api/auth/line). */
export async function exchangeLineToken(): Promise<void> {
  const idToken = liff.getIDToken();
  if (!idToken) throw new Error("ไม่ได้รับข้อมูลยืนยันตัวตนจาก LINE");
  const r = await fetch("/api/auth/line", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
  if (!r.ok) throw new Error(((await r.json().catch(() => null)) as { error?: string } | null)?.error ?? "เข้าสู่ระบบไม่สำเร็จ");
}

/** Sends the user to LINE Login, remembering where to go afterwards. */
export function startLineLogin(next: string): void {
  try {
    sessionStorage.setItem(PENDING_KEY, safePath(next) ?? "/funds");
  } catch {
    /* storage blocked: they land on the root and can open the menu from there */
  }
  liff.login({ redirectUri: SITE_URL || window.location.origin });
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
    await exchangeLineToken();
    window.location.replace(next);
  } catch {
    window.location.replace(`/login?next=${encodeURIComponent(next)}`);
  }
}

/** Logs the user out of LINE (LIFF). The caller clears our own session separately. */
export function liffLogout(): void {
  if (!LIFF_ID) return;
  try {
    if (liff.isLoggedIn()) liff.logout();
  } catch {
    /* ignore */
  }
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

import { getIdToken, isLiffConfigured } from "./liff";

// Empty = same origin; next.config.ts forwards /api/* to FastAPI (needed for LIFF / phones).
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim();
const JWT_STORAGE_KEY = "u-ledger-jwt";

export function getStoredJwt(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(JWT_STORAGE_KEY);
}

export function setStoredJwt(token: string): void {
  window.localStorage.setItem(JWT_STORAGE_KEY, token);
}

export function clearStoredJwt(): void {
  window.localStorage.removeItem(JWT_STORAGE_KEY);
}

let sessionPromise: Promise<void> | null = null;

/** Inside LIFF: exchanges the LINE ID token for our JWT once. Without LIFF
 * (local dev / demo) the backend serves the seeded demo shop, so no-op. */
export function ensureSession(): Promise<void> {
  if (!isLiffConfigured() || getStoredJwt()) return Promise.resolve();
  sessionPromise ??= (async () => {
    const idToken = await getIdToken();
    if (!idToken) return;
    const { access_token } = await request<{ access_token: string }>("/api/v1/auth/line", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken }),
    });
    setStoredJwt(access_token);
  })().finally(() => {
    sessionPromise = null;
  });
  return sessionPromise;
}

async function request<T>(path: string, init?: RequestInit, as: "json" | "blob" = "json"): Promise<T> {
  const token = getStoredJwt();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) clearStoredJwt();
    const body = await response.json().catch(() => null);
    // Mock-data routes (Market Radar, U-Fox) use FastAPI's default `{ detail }` shape.
    const detail = typeof body?.detail === "string" ? body.detail : undefined;
    const message = body?.error?.message_th ?? detail ?? `คำขอล้มเหลว (${response.status})`;
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T; // e.g. DELETE: no body to parse
  return (as === "blob" ? response.blob() : response.json()) as Promise<T>;
}

/** Thin fetch wrapper: base URL + JSON + bearer token. Backend error shape is
 * `{ error: { code, message_th } }` (backend/app/core/errors.py), or `{ detail }` from mock-data routes. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  await ensureSession();
  return request<T>(path, init);
}

/** Same as apiFetch but returns the raw body, e.g. audio from /api/voice/speak. */
export async function apiFetchBlob(path: string, init?: RequestInit): Promise<Blob> {
  await ensureSession();
  return request<Blob>(path, init, "blob");
}

export async function checkHealth(): Promise<{ status: string }> {
  return request("/health");
}

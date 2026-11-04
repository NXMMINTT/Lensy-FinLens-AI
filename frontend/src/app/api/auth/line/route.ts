/**
 * POST /api/auth/line { idToken } -> sets the session cookie.
 * The LINE ID token from LIFF is verified with LINE's own endpoint; only a hash of the userId is kept.
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { hashUserId, SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export const runtime = "nodejs";

/** LINE Login channel id: LINE_LOGIN_CHANNEL_ID, or the part of the LIFF ID before the dash. */
function channelId(): string | null {
  return process.env.LINE_LOGIN_CHANNEL_ID?.trim() || process.env.NEXT_PUBLIC_LIFF_ID?.trim().split("-")[0] || null;
}

export async function POST(req: Request) {
  const body = z.object({ idToken: z.string().min(10) }).safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ ok: false, error: "ไม่มีข้อมูลยืนยันตัวตนจาก LINE" }, { status: 400 });
  const clientId = channelId();
  if (!clientId) return NextResponse.json({ ok: false, error: "ยังไม่ได้ตั้งค่า LINE Login (NEXT_PUBLIC_LIFF_ID)" }, { status: 503 });

  const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: body.data.idToken, client_id: clientId }),
  });
  if (!res.ok) return NextResponse.json({ ok: false, error: "LINE ยืนยันตัวตนไม่สำเร็จ กรุณาลองใหม่" }, { status: 401 });
  const claims = (await res.json()) as { sub?: string };
  if (!claims.sub) return NextResponse.json({ ok: false, error: "LINE ยืนยันตัวตนไม่สำเร็จ" }, { status: 401 });

  const out = NextResponse.json({ ok: true });
  out.cookies.set(SESSION_COOKIE, await signSession({ sub: await hashUserId(claims.sub), demo: false }), sessionCookieOptions);
  return out;
}

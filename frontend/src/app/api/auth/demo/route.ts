/** POST /api/auth/demo -> demo session. Only while LINE Login (LIFF) is not configured. */
import { NextResponse } from "next/server";

import { demoLoginAllowed, SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export async function POST() {
  if (!demoLoginAllowed()) return NextResponse.json({ ok: false, error: "โหมดทดลองปิดแล้ว กรุณาเข้าสู่ระบบด้วย LINE" }, { status: 403 });
  const out = NextResponse.json({ ok: true });
  out.cookies.set(SESSION_COOKIE, await signSession({ sub: "demo", demo: true }), sessionCookieOptions);
  return out;
}

/** POST /api/auth/logout -> clears the session cookie. */
import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/session";

export async function POST() {
  const out = NextResponse.json({ ok: true });
  out.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return out;
}

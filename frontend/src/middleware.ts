import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/session";

/** The AI chat and its endpoint need a login; every other page can be read without one. */
export async function middleware(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ kind: "error", answer: "กรุณาเข้าสู่ระบบก่อนค่ะ", refs: [] }, { status: 401 });
  }
  const login = req.nextUrl.clone();
  login.pathname = "/login";
  login.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(login);
}

export const config = {
  // everything else (funds, compare, calculator, topics, knowledge pages) is open to read without
  // a login; only the AI chat needs one, so its quota is spent on signed-in people
  matcher: ["/chat/:path*", "/api/ask"],
};

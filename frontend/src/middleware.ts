import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/session";

/** Dashboard pages and the AI endpoint need a login; the promo home page does not. */
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
  matcher: [
    "/funds/:path*",
    "/explain/:path*",
    "/reference/:path*",
    "/compare/:path*",
    "/calculator/:path*",
    "/chat/:path*",
    "/glossary/:path*",
    "/checklist/:path*",
    "/stocks/:path*",
    "/api/ask",
  ],
};

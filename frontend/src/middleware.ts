import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/session";

/**
 * Only the Premium features, which keep personal data (a portfolio, saved checks), need a login.
 * Comparing, the calculator, fund pages, the glossary, the checklist and the chat (with /api/ask)
 * are open, so a visitor can try น้อง Lensy straight from the home page.
 */
export async function middleware(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  const login = req.nextUrl.clone();
  login.pathname = "/login";
  login.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/portfolio/:path*", "/claim-check/:path*", "/premium/:path*"],
};

import { cookies } from "next/headers";

import { SESSION_COOKIE, verifySession } from "@/lib/session";

import { LandingHeader } from "../LandingHeader";
import { LandingFooter } from "../LandingSections";
import { AppTabBar } from "./AppTabBar";

/** Frame for the dashboard pages: header, content, footer with the disclaimer, phone tab bar. */
// sampleNote is kept so pages can still say whether they show sample data; the label itself is on the page
export async function AppShell({ children }: { children: React.ReactNode; sampleNote?: boolean }) {
  // pages are open without a login now, so the header asks whether this visitor is signed in
  const signedIn = (await verifySession((await cookies()).get(SESSION_COOKIE)?.value)) !== null;
  return (
    <div className="overflow-x-clip text-ink">
      <LandingHeader signedIn={signedIn} inApp />
      <main className="min-h-[70svh] bg-surface pb-24 md:pb-0">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-8 md:px-6 md:py-10">{children}</div>
      </main>
      {/* phones: no footer inside the app (the tab bar is the way around; ☰ links the privacy page) */}
      <div className="hidden md:block">
        <LandingFooter />
      </div>
      <AppTabBar />
    </div>
  );
}

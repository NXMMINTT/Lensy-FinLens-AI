import { cookies } from "next/headers";

import { SESSION_COOKIE, verifySession } from "@/lib/session";

import { LandingHeader } from "../LandingHeader";
import { LandingFooter } from "../LandingSections";
import { AppTabBar } from "./AppTabBar";

/** Frame for the app pages: header, content, footer with the disclaimer, phone tab bar.
 * The pages are open to everyone; the logout button shows only when there is a session. */
// sampleNote is kept so pages can still say whether they show sample data; the label itself is on the page
export async function AppShell({ children }: { children: React.ReactNode; sampleNote?: boolean }) {
  const signedIn = Boolean(await verifySession((await cookies()).get(SESSION_COOKIE)?.value));
  return (
    <div className="overflow-x-clip text-ink">
      <LandingHeader app signedIn={signedIn} />
      <main className="min-h-[70svh] bg-surface pb-24 md:pb-0">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-8 md:px-6 md:py-10">{children}</div>
      </main>
      <div className="pb-[60px] md:pb-0">
        <LandingFooter />
      </div>
      <AppTabBar />
    </div>
  );
}

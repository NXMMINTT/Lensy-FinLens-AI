import { LandingHeader } from "../LandingHeader";
import { LandingFooter } from "../LandingSections";
import { AppTabBar } from "./AppTabBar";

/** Frame for the dashboard pages: header, content, footer with the disclaimer, phone tab bar. */
export function AppShell({ children, sampleNote }: { children: React.ReactNode; sampleNote: boolean }) {
  return (
    <div className="overflow-x-clip text-ink">
      <LandingHeader signedIn />
      <main className="min-h-[70svh] bg-surface pb-24 md:pb-0">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-8 md:px-6 md:py-10">{children}</div>
      </main>
      <div className="pb-[60px] md:pb-0">
        <LandingFooter sampleNote={sampleNote} />
      </div>
      <AppTabBar />
    </div>
  );
}

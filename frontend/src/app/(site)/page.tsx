import { LandingHeader } from "@/components/finlens/LandingHeader";
import { Faq, Features, Hero, LandingFooter, Pricing, SampleNotice, StartCta } from "@/components/finlens/LandingSections";

// FinLens AI landing page (project brief: hero with the chat phone, the 4 features with sample chats,
// pricing, FAQ, and the "not investment advice" line). Layout ideas reused from the U-Ledger home page
// (components/home), which stays in the repo as reference.
export default function HomePage() {
  return (
    <div className="overflow-x-clip text-ink">
      <LandingHeader />
      <main>
        <Hero />
        <SampleNotice />
        <div className="bg-sky">
          <Features />
          <Pricing />
          <Faq />
          <StartCta />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

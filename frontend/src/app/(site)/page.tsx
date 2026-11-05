import { FeatureBento } from "@/components/finlens/home/FeatureBento";
import { FeeSlider } from "@/components/finlens/home/FeeSlider";
import { LandingHeader } from "@/components/finlens/LandingHeader";
import {
  FaqAccordion,
  Hero,
  HowItWorks,
  LandingFooter,
  PricingTable,
  Promises,
  SampleNotice,
  StartCta,
} from "@/components/finlens/LandingSections";

// FinLens AI landing page: the "magnifier over the fund documents" concept.
// Every page shows the "not investment advice" line (hero + footer) and sample data is labelled.
export default function HomePage() {
  return (
    <div className="overflow-x-clip text-ink">
      <LandingHeader />
      <main>
        <Hero />
        <SampleNotice />
        <FeatureBento />
        <FeeSlider />
        <HowItWorks />
        <Promises />
        <PricingTable />
        <FaqAccordion />
        <StartCta />
      </main>
      <LandingFooter />
    </div>
  );
}

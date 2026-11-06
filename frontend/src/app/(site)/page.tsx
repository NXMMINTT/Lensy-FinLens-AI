import { FeatureBento } from "@/components/finlens/home/FeatureBento";
import { FeeSlider } from "@/components/finlens/home/FeeSlider";
import { LineDemo } from "@/components/finlens/home/LineDemo";
import { TypingChat } from "@/components/finlens/home/TypingChat";
import { LandingHeader } from "@/components/finlens/LandingHeader";
import {
  FaqAccordion,
  Hero,
  HowItWorks,
  LandingFooter,
  PricingTable,
  Promises,
  DataNotice,
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
        <DataNotice />
        <FeatureBento />
        <TypingChat className="bg-brand-tint" bot="รู้ไหมคะว่ากองที่ถืออยู่ เสียค่าใช้จ่ายกี่ชั้น?" user="ไม่รู้เลย ช่วยส่องให้หน่อย" />
        <LineDemo />
        <TypingChat bot="ค่าธรรมเนียมต่างกันแค่ 1% ดูน้อยใช่ไหมคะ?" user="ก็น้อยนะ… หรือไม่?" />
        <FeeSlider />
        <HowItWorks />
        <TypingChat bot="อยากให้น้องบอกเลยไหมคะ ว่ากองไหนดีกว่า?" user="บอกได้เหรอ?" />
        <Promises />
        <PricingTable />
        <FaqAccordion />
        <StartCta />
      </main>
      <LandingFooter />
    </div>
  );
}

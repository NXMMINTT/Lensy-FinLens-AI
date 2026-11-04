import { ChatMarquee } from "@/components/home/ChatMarquee";
import { CompetitorSection } from "@/components/home/CompetitorSection";
import { FaqSection } from "@/components/home/FaqSection";
import { HeroSection } from "@/components/home/HeroSection";
import { LedgerSection } from "@/components/home/LedgerSection";
import { OtherFeaturesSection } from "@/components/home/OtherFeaturesSection";
import { PricingSection } from "@/components/home/PricingSection";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { StartSection } from "@/components/home/StartSection";
import { TaxSection } from "@/components/home/TaxSection";
import { TypingChat } from "@/components/home/TypingChat";

// Public home page. Structure follows parnuan.com: a mascot + real LINE chat hero, numbered
// feature steps next to a visual, sections joined by chat bubbles, then pricing, FAQ and a final CTA.
// Kept clean on purpose (no tilts or doodles); U-Fox and the LINE chat carry the personality.
const THINGS_PEOPLE_TYPE = [
  "ขายน้ำพริก 20 กระปุก 1780",
  "ค่าส่ง Kerry 245",
  "สรุป",
  "ซื้อพริกแห้ง 2 กระสอบ 900",
  "ปีนี้ใกล้ต้องจด VAT ยัง",
  "สบู่มะกรูดเหลือกี่ก้อน",
  "เดือนนี้กำไรเท่าไหร่",
  "ค่ากล่อง 50 ใบ 350",
];

export default function HomePage() {
  return (
    <div className="overflow-x-clip text-ink">
      <SiteHeader />
      <HeroSection />
      <div className="bg-sky">
        <div className="border-y border-sky-line bg-surface/60 py-3">
          <ChatMarquee items={THINGS_PEOPLE_TYPE} />
        </div>
        <LedgerSection />
        <TypingChat bot="ยอดขายเยอะขึ้น กลัวโดนภาษีย้อนหลังไหมคะ?" user="กลัวมาก ช่วยด้วยยย" />
        <TaxSection />
        <TypingChat bot="แล้วรู้ไหมคะว่าคู่แข่งขายสินค้าแบบเดียวกันเท่าไหร่?" user="ไม่รู้เลย แอบส่องให้หน่อย" />
        <CompetitorSection />
        <OtherFeaturesSection />
        <PricingSection />
        <FaqSection />
        <StartSection />
      </div>
      <SiteFooter />
    </div>
  );
}

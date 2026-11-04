import { RadarCard, RadarShell } from "@/components/home/phone/RadarShell";
import { PricePositionBar } from "@/components/market/PricePositionBar";

/** Radar step 1: U-Fox's suggested price and where the shop sits (numbers from mock-data P001). */
export function PriceRadarScreen() {
  return (
    <RadarShell>
      <section className="flex shrink-0 flex-col gap-2 rounded-[18px] bg-sky-deep p-3">
        <div className="text-[11px] font-semibold text-brand">U-Fox แนะนำวันนี้</div>
        <p className="m-0 leading-relaxed">ราคา 110 บาทสอดคล้องกับค่ากลางของตลาดและราคาบน TikTok Shop ช่วยให้แข่งขันได้ดี</p>
        <div className="flex flex-col items-center rounded-[14px] bg-surface py-2">
          <span className="text-[10px] text-ink-muted">ราคาแนะนำ</span>
          <b className="text-[22px] leading-tight text-brand">฿110</b>
          <span className="text-[10px] text-ink-muted">กำไร ฿55 ต่อชิ้น</span>
        </div>
      </section>
      <RadarCard title="ราคาของคุณอยู่ตรงไหน" subtitle="เทียบกับร้านในไทยที่มีของ">
        <PricePositionBar competitorPrices={[95, 105, 110, 115, 130]} myPrice={120} suggestedPrice={110} />
      </RadarCard>
    </RadarShell>
  );
}

import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { FundBrowser } from "@/components/finlens/app/FundBrowser";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { toFundSummary } from "@/lib/fundSummary";
import { getVerifiedFunds } from "@/lib/funds";
import { REFERENCE, REFERENCE_ACCESSED, toRefCard } from "@/lib/reference";

export const metadata: Metadata = {
  title: "ดูทีละกอง | FinLens AI",
  description:
    "ค่าใช้จ่ายทุกชั้น เสียกี่บาท และความเสี่ยงของแต่ละกอง พร้อมข้อมูลอ้างอิงการลงทุน 10 หมวด ทุกตัวเลขบอกที่มา ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default function ExplainPage() {
  const funds = getVerifiedFunds().map(toFundSummary);
  const refs = REFERENCE.flatMap((c) => c.items.map(toRefCard));
  const categories = REFERENCE.map((c) => ({ num: c.num, title: c.title }));

  return (
    <AppShell sampleNote={funds.some((f) => f.isSample)}>
      <PageHeader
        label="ดูทีละกอง"
        title="กองนี้มีค่าใช้จ่ายอะไร"
        mark="เสี่ยงเรื่องไหน"
        text="เลือกกองเพื่อดูค่าใช้จ่ายทุกชั้น ต้นทุนต่อปีรวม และความเสี่ยงที่อาจมองข้าม หรือเลือกหัวข้อการลงทุนเพื่อดูตัวเลขล่าสุด วิธีตรวจเอง และแหล่งที่มา"
        pose="checklist"
      />
      <FundBrowser funds={funds} refs={refs} categories={categories} />
      <p className="m-0 rounded-xl bg-brand-tint px-4 py-3 text-[14px] text-ink-body">
        ตัวเลขของกองตรวจจากเอกสารของกอง ส่วนหมวดการลงทุนอื่น ๆ มาจากผลค้นหาเมื่อ {REFERENCE_ACCESSED} รอบที่ 1
        ยังไม่ได้เปิดอ่านเอกสารต้นฉบับเต็มทุกแหล่ง ดูป้ายสถานะบนการ์ดและกดลิงก์แหล่งที่มาตรวจซ้ำก่อนใช้
      </p>
    </AppShell>
  );
}

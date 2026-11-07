import type { Metadata } from "next";

import { Disclaimer } from "@/components/finlens/Disclaimer";
import { LandingHeader } from "@/components/finlens/LandingHeader";
import { LandingFooter } from "@/components/finlens/LandingSections";
import { LearnList } from "@/components/finlens/learn/LearnList";
import { MiniMarkdown } from "@/components/finlens/learn/MiniMarkdown";
import { Lensy } from "@/components/finlens/Lensy";
import { GENERAL_NOTE } from "@/lib/ask";
import { LEARN, LEARN_COUNT } from "@/lib/learn";

export const metadata: Metadata = {
  title: `${LEARN_COUNT} คำถามก่อนลงทุน | FinLens AI`,
  description:
    "รวมคำถามที่ควรรู้ก่อนลงทุน ตั้งแต่พื้นฐาน ผลตอบแทนและความเสี่ยง ค่าธรรมเนียม การซื้อขาย ความน่าเชื่อถือ การลงทุนต่างประเทศ ภาษี และการตรวจสอบข้อมูล ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default function LearnPage() {
  const answers = Object.fromEntries(LEARN.flatMap((g) => g.items.map((it) => [it.n, <MiniMarkdown key={it.n} text={it.body} />])));
  return (
    <div className="overflow-x-clip text-ink">
      <LandingHeader />
      <main className="bg-surface">
        <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-5 py-12 md:px-6">
          <header className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex max-w-[620px] flex-col gap-3">
              <span className="self-start rounded-md bg-brand-soft px-2.5 py-1 text-[14px] font-bold text-brand">ความหมาย</span>
              <h1 className="m-0 text-[30px] font-bold leading-tight md:text-[40px]">
                {LEARN_COUNT} คำถาม <span className="marker-green">ก่อนลงทุน</span>
              </h1>
              <p className="m-0 text-ink-body">ตั้งแต่ศัพท์พื้นฐาน ค่าธรรมเนียม ภาษี ไปจนถึงวิธีตรวจว่าข้อมูลมาจากไหน อ่านทีละข้อ หรือค้นหาคำที่สงสัยได้เลยค่ะ</p>
              <span className="self-start rounded-md bg-sky px-2 py-0.5 text-[13px] text-ink-muted">{GENERAL_NOTE}</span>
            </div>
            <Lensy pose="idea" size={130} className="max-sm:hidden" />
          </header>

          <LearnList groups={LEARN} answers={answers} />

          <p className="m-0 rounded-xl bg-brand-tint px-4 py-3 text-[14px] text-ink-body">
            ตัวเลขในคำตอบเป็นตัวอย่างสมมติเพื่ออธิบายหลักการ ไม่ใช่ข้อมูลของผลิตภัณฑ์ใด ส่วนกฎหมายและภาษีอาจเปลี่ยนแปลงได้ ควรตรวจประกาศฉบับล่าสุดจากหน่วยงานที่เกี่ยวข้องก่อนตัดสินใจ
          </p>
          <Disclaimer />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

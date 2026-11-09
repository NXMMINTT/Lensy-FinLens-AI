import type { Metadata } from "next";
import Link from "next/link";

import { LandingHeader } from "@/components/finlens/LandingHeader";
import { LandingFooter } from "@/components/finlens/LandingSections";
import { LearnHashRedirect } from "@/components/finlens/learn/LearnHashRedirect";
import { Lensy } from "@/components/finlens/Lensy";
import { GENERAL_NOTE } from "@/lib/ask";
import { chapterTitle, LEARN } from "@/lib/learn";

export const metadata: Metadata = {
  title: "คำถามที่ควรรู้ก่อนลงทุน | FinLens AI",
  description:
    "รวมคำถามที่ควรรู้ก่อนลงทุน 8 บท ตั้งแต่พื้นฐาน ผลตอบแทนและความเสี่ยง ค่าธรรมเนียม การซื้อขาย ความน่าเชื่อถือ การลงทุนต่างประเทศ ภาษี และการตรวจสอบข้อมูล ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

/** The table of contents: one row per chapter, each opening /learn/<id>. */
export default function LearnPage() {
  return (
    <div className="overflow-x-clip text-ink">
      <LandingHeader />
      <LearnHashRedirect chapters={LEARN.map((g) => ({ id: g.id, first: g.items[0].n, last: g.items[g.items.length - 1].n }))} />
      <main className="bg-surface">
        <div className="mx-auto flex max-w-[760px] flex-col gap-10 px-5 py-12 md:px-6 md:py-16">
          <header className="flex items-center justify-between gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-[14px] font-bold tracking-wide text-brand">ความรู้ก่อนลงทุน</span>
              <h1 className="m-0 text-[32px] font-bold leading-tight md:text-[42px]">คำถามที่ควรรู้ก่อนลงทุน</h1>
              <p className="m-0 text-[17px] leading-relaxed text-ink-body">
                อ่านเรียงตามบท หรือเลือกเฉพาะบทที่สงสัย แต่ละบทตอบคำถามที่คนมักถามก่อนตัดสินใจลงทุน ด้วยภาษาง่าย ๆ
              </p>
            </div>
            <Lensy pose="idea" size={120} className="max-sm:hidden" />
          </header>

          <nav aria-labelledby="toc-title">
            <h2 id="toc-title" className="m-0 border-b border-line pb-3 text-[15px] font-bold tracking-wide text-ink-muted">
              สารบัญ
            </h2>
            <ol className="m-0 list-none p-0">
              {LEARN.map((g, i) => (
                <li key={g.id} className="border-b border-line-subtle">
                  <Link href={`/learn/${g.id}`} className="group flex items-start gap-5 py-5 no-underline md:gap-7">
                    <span className="w-16 shrink-0 pt-1 text-[13px] font-semibold text-ink-faint">บทที่ {i + 1}</span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="text-[20px] font-bold leading-snug text-ink group-hover:text-brand md:text-[22px]">{chapterTitle(g)}</span>
                      <span className="line-clamp-2 text-[15px] leading-relaxed text-ink-muted">
                        {g.items
                          .slice(0, 3)
                          .map((it) => it.q)
                          .join(" · ")}
                      </span>
                    </span>
                    <span className="shrink-0 pt-1.5 text-[13px] text-ink-faint">{g.items.length} ข้อ</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex flex-col gap-3">
            <p className="m-0 text-[14px] text-ink-muted">{GENERAL_NOTE}</p>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

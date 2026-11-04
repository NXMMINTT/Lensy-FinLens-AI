import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/finlens/app/AppShell";
import { FundBrowser } from "@/components/finlens/app/FundBrowser";
import { Disclaimer } from "@/components/finlens/Disclaimer";
import { Lensy } from "@/components/finlens/Lensy";
import { toFundSummary } from "@/lib/fundSummary";
import { getVerifiedFunds } from "@/lib/funds";

export const metadata: Metadata = {
  title: "กองทุน | FinLens AI",
  description: "ดูค่าใช้จ่ายทุกชั้น ความเสี่ยง และเงื่อนไขการขายคืนของกองทุน พร้อมเลขหน้าในเอกสาร ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

const TOOLS = [
  { href: "/compare", title: "เทียบต้นทุนเป็นบาท", text: "เลือก 2–3 กอง ดูว่าค่าธรรมเนียมต่างกันกี่บาท", pose: "chart" as const },
  { href: "/chat", title: "ถามน้อง Lensy", text: "ศัพท์ยาก ๆ ถามได้ ตอบพร้อมเลขหน้า", pose: "idea" as const },
];

export default function FundsPage() {
  const funds = getVerifiedFunds().map(toFundSummary);
  const anySample = funds.some((f) => f.isSample);

  return (
    <AppShell sampleNote={anySample}>
      <header className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-gradient-to-br from-brand to-brand-dark px-6 py-6 text-white md:px-8">
        <div className="flex max-w-[620px] flex-col gap-2">
          <h1 className="m-0 text-[28px] font-bold leading-tight md:text-[36px]">สวัสดีค่ะ อยากส่องกองไหนดีคะ</h1>
          <p className="m-0 opacity-90">เลือกกองเพื่อดูค่าใช้จ่ายทุกชั้น ความเสี่ยงที่อาจมองข้าม และเงื่อนไขการขายคืน ทุกตัวเลขกดดูข้อความในเอกสารได้</p>
          <p className="m-0 text-[14px] opacity-80">ⓘ ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน</p>
        </div>
        <Lensy pose="magnifier" size={130} className="max-sm:hidden" />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section aria-label="รายการกองทุน" className="min-w-0">
          <FundBrowser funds={funds} />
        </section>

        <aside className="flex flex-col gap-4">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} className="flex items-center gap-3 rounded-[20px] border border-line bg-surface p-4 text-ink no-underline hover:border-brand">
              <Lensy pose={t.pose} size={64} />
              <span className="flex flex-col">
                <b className="text-[17px]">{t.title}</b>
                <span className="text-[14px] text-ink-muted">{t.text}</span>
              </span>
            </Link>
          ))}
          <div className="flex items-center gap-3 rounded-[20px] border border-dashed border-line bg-surface/60 p-4">
            <Lensy pose="coins" size={64} className="opacity-80" />
            <span className="flex flex-col">
              <span className="flex items-center gap-2">
                <b className="text-[17px]">ส่องพอร์ต</b>
                <span className="rounded-full bg-sun px-2 py-0.5 text-[11px] font-bold text-[#4A3500]">Premium · เร็ว ๆ นี้</span>
              </span>
              <span className="text-[14px] text-ink-muted">รวมค่าใช้จ่ายและความเสี่ยงของทุกกองที่ถืออยู่</span>
            </span>
          </div>
          <Disclaimer className="text-[14px]" />
        </aside>
      </div>
    </AppShell>
  );
}

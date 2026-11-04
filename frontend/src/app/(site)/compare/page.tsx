import type { Metadata } from "next";

import { CompareTool } from "@/components/finlens/compare/CompareTool";
import { Disclaimer } from "@/components/finlens/Disclaimer";
import { LandingHeader } from "@/components/finlens/LandingHeader";
import { LandingFooter } from "@/components/finlens/LandingSections";
import { pickInitialCodes, toCompareFund } from "@/lib/compare";
import { getVerifiedFunds } from "@/lib/funds";

export const metadata: Metadata = {
  title: "เทียบต้นทุนที่แท้จริง | FinLens AI",
  description: "เทียบค่าธรรมเนียมทุกชั้นของกองทุน 2–3 กอง เป็นเงินบาท พร้อมเลขหน้าในเอกสาร ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ funds?: string }> }) {
  const { funds: fundsParam } = await searchParams;
  const funds = getVerifiedFunds().map(toCompareFund);
  const initialCodes = pickInitialCodes(funds, fundsParam);
  const anySample = funds.some((f) => f.isSample);

  return (
    <div className="overflow-x-clip text-ink">
      <LandingHeader />
      <main className="bg-dots">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-8 md:px-6 md:py-10">
          <header className="flex flex-col gap-2">
            <span className="self-start rounded-md border border-brand/30 bg-surface px-3 py-1 text-[14px] font-semibold text-brand">True Cost Calculator</span>
            <h1 className="m-0 text-[30px] font-bold leading-tight md:text-[40px]">
              เทียบต้นทุนที่แท้จริง <span className="marker-green">เป็นบาท</span>
            </h1>
            <p className="m-0 max-w-[720px] text-ink-body">
              รวมค่าใช้จ่ายทุกชั้นของแต่ละกอง แล้วคำนวณว่าเงินที่ลงทุนจะเสียไปกับค่าธรรมเนียมเท่าไหร่ ทุกตัวเลขมีเลขหน้าในเอกสารให้ตรวจเองได้
            </p>
            <Disclaimer />
          </header>
          {funds.length < 2 ? (
            <p className="m-0 rounded-2xl border border-line bg-surface p-6">ยังมีข้อมูลกองทุนที่ตรวจแล้วไม่ถึง 2 กอง จึงยังเทียบไม่ได้</p>
          ) : (
            <CompareTool funds={funds} initialCodes={initialCodes} />
          )}
        </div>
      </main>
      <LandingFooter sampleNote={anySample} />
    </div>
  );
}

import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { CompareTool } from "@/components/finlens/compare/CompareTool";
import { pickInitialCodes, toCompareFund } from "@/lib/compare";
import { getVerifiedFunds } from "@/lib/funds";

export const metadata: Metadata = {
  title: "เทียบกองทุน | FinLens AI",
  description: "วางค่าธรรมเนียมทุกชั้นของกองทุน 2–3 กองเทียบกัน เห็นชั้นที่ซ่อนอยู่ในหนังสือชี้ชวน พร้อมเลขหน้า ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ funds?: string }> }) {
  const { funds: fundsParam } = await searchParams;
  const funds = getVerifiedFunds().map(toCompareFund);
  const initialCodes = pickInitialCodes(funds, fundsParam);

  return (
    <AppShell sampleNote={funds.some((f) => f.isSample)}>
      <PageHeader
        label="เทียบกองทุน"
        title="เทียบ 2–3 กองเคียงกัน"
        mark="เห็นค่าธรรมเนียมแฝง"
        text="ค่าธรรมเนียมทุกชั้นวางเทียบทีละบรรทัด ชั้นที่อยู่ในหนังสือชี้ชวนแต่ไม่อยู่ใน Factsheet มีป้ายเตือน ทุกค่ามีเลขหน้า"
        pose="magnifier"
      />
      {funds.length < 2 ? (
        <p className="m-0 rounded-2xl border border-line bg-surface p-6">ยังมีข้อมูลกองทุนที่ตรวจแล้วไม่ถึง 2 กอง จึงยังเทียบไม่ได้</p>
      ) : (
        <CompareTool funds={funds} initialCodes={initialCodes} mode="fees" />
      )}
    </AppShell>
  );
}

import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { CompareTool } from "@/components/finlens/compare/CompareTool";
import { pickInitialCodes, toCompareFund } from "@/lib/compare";
import { getVerifiedFunds } from "@/lib/funds";

export const metadata: Metadata = {
  title: "เทียบกองทุน | FinLens AI",
  description: "วางค่าธรรมเนียมทุกชั้นของกองทุนหลายกองเทียบกัน เห็นชั้นที่ Factsheet ของกองไทยไม่ได้แสดง ทุกตัวเลขบอกที่มา ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ funds?: string }> }) {
  const { funds: fundsParam } = await searchParams;
  const funds = getVerifiedFunds().map(toCompareFund);
  // no funds picked until the user chooses, unless the link names them (e.g. from LINE)
  const initialCodes = fundsParam ? pickInitialCodes(funds, fundsParam) : [];

  return (
    <AppShell sampleNote={funds.some((f) => f.isSample)}>
      <PageHeader
        label="เทียบกองทุน"
        title="เทียบกองทุนเคียงกัน"
        mark="เห็นค่าธรรมเนียมแฝง"
        text="วางค่าธรรมเนียมทุกชั้นเทียบกันทีละบรรทัด ชั้นที่ Factsheet ไม่ได้แสดงจะมีป้ายเตือน และทุกตัวเลขบอกที่มา"
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

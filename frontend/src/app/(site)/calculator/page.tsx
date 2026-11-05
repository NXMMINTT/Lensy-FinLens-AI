import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { CompareTool } from "@/components/finlens/compare/CompareTool";
import { pickInitialCodes, toCompareFund } from "@/lib/compare";
import { getVerifiedFunds } from "@/lib/funds";

export const metadata: Metadata = {
  title: "คำนวณเป็นบาท | FinLens AI",
  description: "คำนวณว่าค่าธรรมเนียมกินเงินลงทุนไปกี่บาท ปรับเงิน จำนวนปี และผลตอบแทนสมมติได้ ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default async function CalculatorPage({ searchParams }: { searchParams: Promise<{ funds?: string }> }) {
  const { funds: fundsParam } = await searchParams;
  const funds = getVerifiedFunds().map(toCompareFund);
  const initialCodes = pickInitialCodes(funds, fundsParam, 1);

  return (
    <AppShell sampleNote={funds.some((f) => f.isSample)}>
      <PageHeader
        label="คำนวณเป็นบาท"
        title="ค่าธรรมเนียมกินเงินไป"
        mark="กี่บาท"
        text="ปรับเงินลงทุน จำนวนปี และผลตอบแทนสมมติ แล้วดูว่าค่าใช้จ่ายทุกชั้นรวมกันเป็นเงินเท่าไหร่ คำนวณด้วยสูตร ไม่ได้ให้ AI คิดตัวเลข"
        pose="coins"
      />
      {funds.length === 0 ? (
        <p className="m-0 rounded-2xl border border-line bg-surface p-6">ยังไม่มีข้อมูลกองทุนที่ตรวจแล้วค่ะ</p>
      ) : (
        <CompareTool funds={funds} initialCodes={initialCodes} mode="money" />
      )}
    </AppShell>
  );
}

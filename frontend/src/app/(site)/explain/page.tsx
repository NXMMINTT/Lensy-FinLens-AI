import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { FundBrowser } from "@/components/finlens/app/FundBrowser";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { toFundSummary } from "@/lib/fundSummary";
import { getVerifiedFunds } from "@/lib/funds";

export const metadata: Metadata = {
  title: "ดูทีละกอง | FinLens AI",
  description: "ค่าใช้จ่ายทุกชั้น เสียกี่บาท และความเสี่ยงของแต่ละกอง พร้อมเลขหน้าในเอกสาร ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default function ExplainPage() {
  const funds = getVerifiedFunds().map(toFundSummary);

  return (
    <AppShell sampleNote={funds.some((f) => f.isSample)}>
      <PageHeader
        label="ดูทีละกอง"
        title="กองนี้มีค่าใช้จ่ายอะไร"
        mark="เสี่ยงเรื่องไหน"
        text="เลือกกองเพื่อดูค่าใช้จ่ายทุกชั้น ต้นทุนต่อปีรวม ความเสี่ยงที่อาจมองข้าม และเงื่อนไขการขายคืน ทุกตัวเลขกดดูข้อความในเอกสารได้"
        pose="checklist"
      />
      <FundBrowser funds={funds} />
    </AppShell>
  );
}

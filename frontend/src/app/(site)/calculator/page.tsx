import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { IconRail, type RailItem } from "@/components/finlens/app/IconRail";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { RateCalc, type RateRow } from "@/components/finlens/calculator/RateCalc";
import { CompareTool } from "@/components/finlens/compare/CompareTool";
import { pickInitialCodes, toCompareFund } from "@/lib/compare";
import { getVerifiedFunds } from "@/lib/funds";
import { RATE_ITEMS } from "@/lib/rateCalc";
import { REFERENCE, refItem } from "@/lib/reference";

export const metadata: Metadata = {
  title: "คำนวณเป็นบาท | FinLens AI",
  description:
    "คำนวณว่าค่าธรรมเนียมกองทุนกินเงินไปกี่บาท หรือเงินฝากและพันธบัตรให้ดอกเบี้ยประมาณกี่บาท ปรับเงินและจำนวนปีได้ ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

const CALC_HINT: Record<number, string> = { 1: "ดอกเบี้ยเงินฝากได้กี่บาท", 2: "ดอกเบี้ยพันธบัตรได้กี่บาท" };

export default async function CalculatorPage({ searchParams }: { searchParams: Promise<{ funds?: string; cat?: string }> }) {
  const { funds: fundsParam, cat: catParam } = await searchParams;
  const funds = getVerifiedFunds().map(toCompareFund);
  // only the groups that have a rate to calculate with
  const groups = REFERENCE.filter((c) => RATE_ITEMS.some((r) => r.group === c.num));
  const cat = groups.find((c) => String(c.num) === catParam);

  const items: RailItem[] = [
    { key: "funds", label: "กองทุน", hint: "ค่าธรรมเนียมกินเงินไปกี่บาท", count: funds.length, href: "/calculator" },
    ...groups.map((c) => ({
      key: String(c.num),
      label: c.title,
      hint: CALC_HINT[c.num] ?? "ได้ผลตอบแทนประมาณกี่บาท",
      count: RATE_ITEMS.filter((r) => r.group === c.num).length,
      href: `/calculator?cat=${c.num}`,
    })),
  ];

  const rows: RateRow[] = cat
    ? RATE_ITEMS.filter((r) => r.group === cat.num).map((r, i) => {
        const t = refItem(r.topic)!;
        return { key: `${r.topic}-${i}`, topic: r.topic, label: r.label, ratePct: r.ratePct, compound: r.compound, note: r.note, asOf: t.asOf, status: t.status };
      })
    : [];

  return (
    <AppShell sampleNote={!cat && funds.some((f) => f.isSample)}>
      <PageHeader
        label="คำนวณเป็นบาท"
        title={cat ? `${cat.title}ให้ผลตอบแทน` : "ค่าธรรมเนียมกินเงินไป"}
        mark="กี่บาท"
        text={
          cat
            ? "ใส่เงินและจำนวนปี แล้วดูว่าแต่ละอัตราให้ดอกเบี้ยหรือผลตอบแทนประมาณกี่บาท คำนวณด้วยสูตร ไม่ได้ให้ AI คิดตัวเลข"
            : "ปรับเงินลงทุน จำนวนปี และผลตอบแทนสมมติ แล้วดูว่าค่าใช้จ่ายทุกชั้นรวมกันเป็นเงินเท่าไหร่ คำนวณด้วยสูตร ไม่ได้ให้ AI คิดตัวเลข"
        }
        pose="coins"
      />

      <IconRail label="คำนวณอะไร" items={items} active={cat ? String(cat.num) : "funds"} />

      {!cat ? (
        funds.length === 0 ? (
          <p className="m-0 rounded-2xl border border-line bg-surface p-6">ยังไม่มีข้อมูลกองทุนที่ตรวจแล้วค่ะ</p>
        ) : (
          <CompareTool funds={funds} initialCodes={fundsParam ? pickInitialCodes(funds, fundsParam, 1) : []} mode="money" />
        )
      ) : (
        <RateCalc rows={rows} />
      )}
    </AppShell>
  );
}

import { baht, pct, SAMPLE_ACTIVE, SAMPLE_CALC, SAMPLE_INDEX, sampleAnnualCost, sampleTrueCost } from "@/lib/sampleFunds";

import { AnswerCard, ChatBody, LensyChatHeader, UserMsg } from "../chat";

/** True Cost Calculator: baht figures from lib/trueCost.ts, never from the AI. */
export function CostScreen() {
  const funds = [SAMPLE_ACTIVE, SAMPLE_INDEX].map((f) => ({ f, r: sampleTrueCost(f) }));
  const max = Math.max(...funds.map((x) => x.r.feeCost));
  const diff = Math.abs(funds[0].r.feeCost - funds[1].r.feeCost);
  return (
    <>
      <LensyChatHeader />
      <ChatBody>
        <UserMsg>
          ลงทุน {SAMPLE_CALC.principal.toLocaleString("th-TH")} บาท {SAMPLE_CALC.years} ปี สองกองนี้เสียค่าธรรมเนียมต่างกันเท่าไหร่
        </UserMsg>
        <AnswerCard title="ต้นทุนที่แท้จริง (เป็นบาท)">
          {funds.map(({ f, r }, i) => (
            <div key={f.code} className="flex flex-col gap-1">
              <div className="flex justify-between gap-2">
                <span>{f.nameTh}</span>
                <b>{baht(r.feeCost)}</b>
              </div>
              <div className="h-2.5 rounded-full bg-line-subtle">
                <div className={`h-full rounded-full ${i === 0 ? "bg-brand" : "bg-brand-light"}`} style={{ width: `${(r.feeCost / max) * 100}%` }} />
              </div>
              <span className="text-[10px] text-ink-muted">
                ต้นทุนต่อปี {pct(sampleAnnualCost(f))} (หน้า {f.ter.page}, {f.masterFundExpense?.page}) · ค่าธรรมเนียมขาย {pct(f.frontEnd.value)} (หน้า {f.frontEnd.page})
              </span>
            </div>
          ))}
          <div className="rounded-lg bg-brand-soft px-2 py-1.5 text-center">
            ส่วนต่าง <b className="text-[15px] text-brand">{baht(diff)}</b>
          </div>
          <span className="text-[10px] text-ink-muted">
            สมมติผลตอบแทน {pct(SAMPLE_CALC.annualReturn, 0)} ต่อปีก่อนหักค่าใช้จ่าย (เป็นสมมติฐาน ไม่ใช่การคาดการณ์) · คำนวณด้วยสูตร ไม่ได้ให้ AI คิดตัวเลข
          </span>
        </AnswerCard>
      </ChatBody>
    </>
  );
}

import { baht, pct, RISK_TAG, SAMPLE_ACTIVE as F, SAMPLE_CALC, SAMPLE_RISKS, sampleAnnualCost, sampleTrueCost } from "@/lib/sampleFunds";

import { AnswerCard, BotMsg, ChatBody, LensyChatHeader, PageRef, UserMsg } from "../chat";

/** First-screen chat: one question, the three answers that matter, each with its page. */
export function HeroScreen() {
  const cost = sampleTrueCost(F);
  const highRisks = SAMPLE_RISKS.filter((r) => r.level === "high");
  return (
    <>
      <LensyChatHeader />
      <ChatBody>
        <BotMsg>สวัสดีค่ะ น้อง Lensy เอง ส่งชื่อกองทุนมาได้เลยค่ะ</BotMsg>
        <UserMsg>{F.nameTh}</UserMsg>
        <AnswerCard title={`สรุป ${F.nameTh}`}>
          <div className="flex items-start justify-between gap-2">
            <span>
              ต้นทุนต่อปีรวม <b className="text-brand">{pct(sampleAnnualCost(F))}</b>
            </span>
            <span className="text-right text-[10px] text-ink-muted">
              หน้า {F.ter.page} Factsheet
              <br />
              และหน้า {F.masterFundExpense?.page} หนังสือชี้ชวน
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span>
              ถือ {SAMPLE_CALC.years} ปี เงิน {SAMPLE_CALC.principal.toLocaleString("th-TH")} บาท เสียค่าธรรมเนียมราว{" "}
              <b className="text-brand">{baht(cost.feeCost)}</b>
            </span>
            <span className="text-[10px] text-ink-muted">สมมติผลตอบแทน {pct(SAMPLE_CALC.annualReturn, 0)} ต่อปี ไม่ใช่การคาดการณ์</span>
          </div>
          {highRisks.map((r) => (
            <div key={r.topic} className="flex items-start justify-between gap-2">
              <span>
                <span className={`mr-1 whitespace-nowrap rounded-full border px-1.5 text-[10px] font-bold ${RISK_TAG[r.level].className}`}>{RISK_TAG[r.level].label}</span>
                {r.topic}: {r.detail}
              </span>
              <PageRef page={r.page} source={r.source} />
            </div>
          ))}
        </AnswerCard>
      </ChatBody>
    </>
  );
}

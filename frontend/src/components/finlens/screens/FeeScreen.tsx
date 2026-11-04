import { pct, SAMPLE_ACTIVE as F, sampleAnnualCost } from "@/lib/sampleFunds";

import { AnswerCard, BotMsg, ChatBody, LensyChatHeader, PageRef, UserMsg } from "../chat";

/** Hidden Fee Detector: every cost layer as a coloured bar, with pages. */
export function FeeScreen() {
  const total = sampleAnnualCost(F);
  const master = F.masterFundExpense!;
  return (
    <>
      <LensyChatHeader />
      <ChatBody>
        <UserMsg>{F.nameTh} มีค่าใช้จ่ายอะไรบ้าง</UserMsg>
        <AnswerCard title="ต้นทุนต่อปีรวม">
          <div className="text-[22px] font-extrabold leading-none text-brand">
            {pct(total)} <span className="text-[11px] font-medium text-ink-muted">ต่อปี</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full">
            <span className="bg-brand" style={{ width: `${(F.ter.value / total) * 100}%` }} />
            <span className="bg-sun" style={{ width: `${(master.value / total) * 100}%` }} />
          </div>
          <div className="flex items-start justify-between gap-2">
            <span>
              <i className="mr-1 inline-block h-2 w-2 rounded-full bg-brand" />
              ค่าใช้จ่ายกองไทย (TER) <b>{pct(F.ter.value)}</b>
            </span>
            <PageRef {...F.ter} />
          </div>
          <div className="flex items-start justify-between gap-2">
            <span>
              <i className="mr-1 inline-block h-2 w-2 rounded-full bg-sun" />
              ค่าใช้จ่ายกองหลัก <b>{pct(master.value)}</b>
            </span>
            <PageRef {...master} />
          </div>
          <div className="rounded-lg bg-sun-soft px-2 py-1.5 text-[11px] text-sun-ink">
            ⚠ ค่าใช้จ่ายกองหลักอยู่ในหนังสือชี้ชวน ไม่อยู่ใน Factsheet
          </div>
        </AnswerCard>
        <BotMsg>ค่าธรรมเนียมขาย {pct(F.frontEnd.value)} ต่อครั้ง (หน้า {F.frontEnd.page}) จ่ายครั้งเดียวตอนซื้อค่ะ</BotMsg>
      </ChatBody>
    </>
  );
}

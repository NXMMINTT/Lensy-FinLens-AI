import { RISK_TAG, SAMPLE_ACTIVE as F, SAMPLE_RISKS } from "@/lib/sampleFunds";

import { AnswerCard, BotMsg, ChatBody, LensyChatHeader, PageRef, UserMsg } from "../chat";

/** Risk Alert: rule-based tags with pages, no "good/bad" verdict. */
export function RiskScreen() {
  return (
    <>
      <LensyChatHeader />
      <ChatBody>
        <UserMsg>มีความเสี่ยงอะไรที่อาจมองข้ามบ้าง</UserMsg>
        <AnswerCard title={`ความเสี่ยงที่ควรรู้ · ${F.nameTh}`}>
          {SAMPLE_RISKS.map((r) => (
            <div key={r.topic} className="flex flex-col gap-0.5 border-b border-line-subtle pb-1.5 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <span className={`whitespace-nowrap rounded-full border px-1.5 text-[10px] font-bold ${RISK_TAG[r.level].className}`}>{RISK_TAG[r.level].label}</span>
                  <b>{r.topic}</b>
                </span>
                <PageRef page={r.page} source={r.source} />
              </div>
              <span className="text-ink-body">{r.detail}</span>
            </div>
          ))}
        </AnswerCard>
        <BotMsg>ป้ายระดับมาจากกฎที่ตั้งไว้ ไม่ใช่การตัดสินว่ากองดีหรือไม่ดีนะคะ</BotMsg>
      </ChatBody>
    </>
  );
}

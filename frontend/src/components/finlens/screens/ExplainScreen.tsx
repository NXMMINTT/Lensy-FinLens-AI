import { pct, SAMPLE_ACTIVE as F } from "@/lib/sampleFunds";

import { AnswerCard, BotMsg, ChatBody, LensyChatHeader, PageRef, UserMsg } from "../chat";

/** AI Explain: plain-language answer with pages, and a polite refusal to recommend. */
export function ExplainScreen() {
  return (
    <>
      <LensyChatHeader />
      <ChatBody>
        <UserMsg>ทำไมผลตอบแทนกองนี้ไม่เท่ากองหลักที่ไปลงทุน</UserMsg>
        <AnswerCard title="อธิบายง่าย ๆ">
          <span>มี 2 เรื่องหลักค่ะ</span>
          <span>
            1. <b>ค่าใช้จ่ายของกองไทยเอง</b> {pct(F.ter.value)} ต่อปี ถูกหักออกก่อน <PageRef {...F.ter} />
          </span>
          <span>
            2. <b>ค่าเงิน</b> กองป้องกันความเสี่ยงค่าเงิน (hedging) ตามดุลยพินิจ เงินบาทแข็งหรืออ่อนจึงทำให้ผลตอบแทนต่างไป <PageRef page={1} source="factsheet" />
          </span>
        </AnswerCard>
        <UserMsg>สรุปว่าควรซื้อไหม</UserMsg>
        <BotMsg>ขอโทษค่ะ น้องแนะนำให้ซื้อหรือขายไม่ได้ แต่ช่วยเทียบค่าใช้จ่ายกับความเสี่ยงของแต่ละกองให้ดูได้นะคะ</BotMsg>
      </ChatBody>
    </>
  );
}

/* "น้อง Lensy ใน LINE": three chat screens that follow the steps as the page scrolls.
 * Every figure, page and label comes from the sample fund files and the app's own rules
 * (lib/sampleFunds.ts → riskRules, trueCost), never typed in here. */
import { NOT_FOUND } from "@/lib/disclaimer";
import { baht, pct, RISK_TAG, SAMPLE_ACTIVE as F, SAMPLE_CALC, SAMPLE_INDEX as B, SAMPLE_RISKS, sampleTrueCost, type SampleFund } from "@/lib/sampleFunds";

import { AnswerCard, BotMsg, ChatBody, LensyChatHeader, PageRef, UserMsg } from "../chat";
import { MascotDecor } from "../Decor";
import { Lensy } from "../Lensy";
import { Phone, ScrollSteps } from "./ScrollSteps";

/** LINE chat with the message bar at the bottom. */
function ChatScreen({ children }: { children: React.ReactNode }) {
  return (
    <Phone>
      <LensyChatHeader />
      <ChatBody>{children}</ChatBody>
      <div className="flex items-center gap-2 bg-surface px-3 py-2.5 text-ink-muted">
        <span className="text-lg leading-none">+</span>
        <span className="flex-1 rounded-full bg-line-subtle px-3 py-1.5">Aa</span>
      </div>
    </Phone>
  );
}

const short = (f: SampleFund) => (f === F ? "กอง A" : "กอง B");

/* 1. two funds in one message → every fee layer side by side */
function CompareScreen() {
  return (
    <ChatScreen>
      <UserMsg>
        {F.nameTh} กับ {B.nameTh}
      </UserMsg>
      <AnswerCard title="เทียบค่าใช้จ่ายทุกชั้น">
        {[F, B].map((f) => (
          <div key={f.code} className="flex flex-col gap-1 rounded-xl bg-brand-tint px-2.5 py-2">
            <b className="text-[12px]">
              {short(f)} · {f.nameTh}
            </b>
            <span className="flex items-baseline justify-between gap-2">
              <span>ค่าใช้จ่ายของกองนี้ (TER) {pct(f.ter.value)}</span>
              <PageRef page={f.ter.page} source={f.ter.source} />
            </span>
            {f.masterFundExpense ? (
              <span className={`flex items-baseline justify-between gap-2 rounded-md px-1 ${f.masterFundExpense.source === "prospectus" ? "bg-[#FFF4D1]" : ""}`}>
                <span>+ กองทุนหลัก {pct(f.masterFundExpense.value)}</span>
                <PageRef page={f.masterFundExpense.page} source={f.masterFundExpense.source} />
              </span>
            ) : (
              <span className="text-ink-muted">กองทุนหลัก: {NOT_FOUND}</span>
            )}
          </div>
        ))}
        <span className="text-[10.5px] font-semibold text-[#7A5200]">⚠ ค่าใช้จ่ายกองหลักอยู่ในหนังสือชี้ชวน ไม่อยู่ใน Factsheet</span>
      </AnswerCard>
    </ChatScreen>
  );
}

/* 2. one fund → the risks people tend to miss, labelled by the app's rules */
function RiskScreen() {
  return (
    <ChatScreen>
      <UserMsg>{F.nameTh}</UserMsg>
      <AnswerCard title="ความเสี่ยงที่ควรรู้">
        {SAMPLE_RISKS.slice(0, 3).map((r) => (
          <div key={`${r.topic}-${r.detail}`} className="flex flex-col gap-0.5 border-b border-line-subtle pb-1.5 last:border-0 last:pb-0">
            <span className="flex items-center gap-1.5">
              <span className={`rounded-full border px-1.5 text-[10px] font-bold ${RISK_TAG[r.level].className}`}>{RISK_TAG[r.level].label}</span>
              <b className="text-[11.5px]">{r.topic}</b>
            </span>
            <span className="flex items-baseline justify-between gap-2">
              <span>{r.detail}</span>
              <PageRef page={r.page} source={r.source} />
            </span>
          </div>
        ))}
      </AnswerCard>
      <BotMsg>ป้ายมาจากกฎที่ตั้งไว้ ไม่ได้บอกว่ากองดีหรือไม่ดีค่ะ</BotMsg>
    </ChatScreen>
  );
}

/* 3. a money question → baht from trueCost, with the assumptions */
function MoneyScreen() {
  const cost = [F, B].map((f) => ({ f, fee: sampleTrueCost(f).feeCost }));
  const principal = SAMPLE_CALC.principal.toLocaleString("th-TH");
  return (
    <ChatScreen>
      <UserMsg>
        ลงทุน {principal} บาท {SAMPLE_CALC.years} ปี เสียกี่บาท
      </UserMsg>
      <AnswerCard title="เสียค่าธรรมเนียมเป็นเงินบาท">
        {cost.map(({ f, fee }) => (
          <span key={f.code} className="flex items-baseline justify-between gap-2">
            <span>{short(f)}</span>
            <b className="text-[14px] text-brand">{baht(fee)}</b>
          </span>
        ))}
        <span className="rounded-lg bg-[#9BE07A]/40 px-2 py-1 text-center font-bold text-[#0F2A12]">ต่างกัน {baht(Math.abs(cost[0].fee - cost[1].fee))}</span>
        <span className="text-[10px] text-ink-muted">
          สมมติผลตอบแทน {pct(SAMPLE_CALC.annualReturn, 0)} ต่อปี ไม่ใช่การคาดการณ์ · คำนวณด้วยสูตร ไม่ได้ให้ AI คิด
        </span>
      </AnswerCard>
    </ChatScreen>
  );
}

export function LineDemo() {
  return (
    <section id="line-demo" aria-labelledby="line-demo-title" className="scroll-mt-16 bg-brand-tint">
      <ScrollSteps
        head={
          <>
            <h2 id="line-demo-title" className="m-0 text-[30px] font-bold leading-tight md:text-[38px]">
              คุยใน LINE
              <br />
              <span className="marker-green">เหมือนถามเพื่อน</span>
            </h2>
            <p className="m-0 text-ink-body">ไม่ต้องเปิดเอกสารหลายสิบหน้า พิมพ์ชื่อกองแล้วน้อง Lensy สรุปให้ ทุกตัวเลขบอกเลขหน้าที่มา</p>
          </>
        }
        steps={[
          ["พิมพ์ 2 กองในข้อความเดียว", "น้องวางค่าใช้จ่ายทุกชั้นเทียบกัน ชั้นที่อยู่ในหนังสือชี้ชวนก็เห็น"],
          ["พิมพ์ชื่อกองเดียว", "ดูความเสี่ยงที่อาจมองข้าม ป้ายมาจากกฎ ไม่ใช่ AI ตัดสิน"],
          ["ถามเป็นบาท", "น้องคำนวณด้วยสูตร บอกส่วนต่างเป็นเงิน และบอกสมมติฐานทุกครั้ง"],
        ]}
        visuals={[<CompareScreen key="compare" />, <RiskScreen key="risk" />, <MoneyScreen key="money" />]}
        decor={
          <span className="pointer-events-none absolute -bottom-12 -right-28 max-sm:-bottom-14 max-sm:-right-3">
            <span className="relative block">
              <Lensy pose="magnifier" size={140} className="max-sm:!h-[96px] max-sm:!w-[96px]" />
              <MascotDecor />
            </span>
          </span>
        }
      />
    </section>
  );
}

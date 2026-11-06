/* "น้อง Lensy ใน LINE": three chat screens that follow the steps as the page scrolls.
 * Every figure, source and label comes from the two real example funds through the app's own
 * functions (lib/homeFunds.ts → totalAnnualCostRate, trueCost, riskRules), never typed in here. */
import { NOT_FOUND } from "@/lib/disclaimer";
import { HOME_CALC, homeFeeDifference, homeFunds, homeRisks, homeTrueCost, MASTER_COST_NOTE, RISK_TAG } from "@/lib/homeFunds";
import { baht, docPct, pct } from "@/lib/money";

import { AnswerCard, BotMsg, ChatBody, LensyChatHeader, PageRef, UserMsg } from "../chat";
import { Curl } from "@/components/decor/Curl";
import { Paw } from "@/components/decor/Paw";

import { DECOR, MascotDecor, Sparkle } from "../Decor";
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

/* 1. two funds in one message → every fee layer side by side */
function CompareScreen() {
  const [A, B] = homeFunds();
  return (
    <ChatScreen>
      <UserMsg>
        {A.code} กับ {B.code}
      </UserMsg>
      <AnswerCard title="เทียบค่าใช้จ่ายทุกชั้น">
        {[A, B].map((f) => (
          <div key={f.code} className="flex flex-col gap-1 rounded-xl bg-brand-tint px-2.5 py-2">
            <b className="text-[12px] leading-snug">
              {f.code} · {f.nameTh}
            </b>
            <span className="flex items-baseline justify-between gap-2">
              <span>ค่าใช้จ่ายของกองนี้ (TER) {docPct(f.ter.value)}</span>
              <PageRef page={f.ter.page} source={f.ter.source} />
            </span>
            {f.masterFundExpense ? (
              <span className="flex items-baseline justify-between gap-2 rounded-md bg-[#FFF4D1] px-1">
                <span>+ กองทุนหลัก {docPct(f.masterFundExpense.value)}</span>
                <PageRef page={f.masterFundExpense.page} source={f.masterFundExpense.source} />
              </span>
            ) : (
              <span className="text-ink-muted">กองทุนหลัก: {NOT_FOUND}</span>
            )}
            <span className="mt-0.5 flex items-baseline justify-between gap-2 border-t border-line-subtle pt-1">
              <b>ต้นทุนต่อปีรวม</b>
              <b className="text-[14px] text-brand">{pct(f.annualCostRate)}</b>
            </span>
          </div>
        ))}
        <span className="text-[10.5px] font-semibold leading-snug text-[#7A5200]">⚠ {MASTER_COST_NOTE}</span>
      </AnswerCard>
    </ChatScreen>
  );
}

/* 2. one fund → the risks people tend to miss, labelled by the app's rules */
function RiskScreen() {
  // fund B: its verified record gives the fuller risk picture (currency, concentration, …)
  const [, B] = homeFunds();
  return (
    <ChatScreen>
      <UserMsg>{B.code}</UserMsg>
      <AnswerCard title="ความเสี่ยงที่ควรรู้">
        {homeRisks(B).slice(0, 3).map((r) => (
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
  const [A, B] = homeFunds();
  const principal = HOME_CALC.principal.toLocaleString("th-TH");
  return (
    <ChatScreen>
      <UserMsg>
        ลงทุน {principal} บาท {HOME_CALC.years} ปี เสียกี่บาท
      </UserMsg>
      <AnswerCard title="เสียค่าธรรมเนียมเป็นเงินบาท">
        {[A, B].map((f) => (
          <span key={f.code} className="flex items-baseline justify-between gap-2">
            <span>{f.code}</span>
            <b className="text-[14px] text-brand">{baht(homeTrueCost(f).feeCost)}</b>
          </span>
        ))}
        <span className="rounded-lg bg-[#9BE07A]/40 px-2 py-1 text-center font-bold text-[#0F2A12]">ต่างกัน {baht(homeFeeDifference(A, B))}</span>
        <span className="text-[10px] text-ink-muted">
          สมมติผลตอบแทน {pct(HOME_CALC.annualReturn, 0)} ต่อปี ไม่ใช่การคาดการณ์ · คำนวณด้วยสูตร ไม่ได้ให้ AI คิด
        </span>
      </AnswerCard>
    </ChatScreen>
  );
}

/** Fills the wide empty space around the step card and the phone: dots, a soft circle, stickers. */
function Backdrop() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* faint dot grid that fades out towards the edges */}
      <span className="bg-dots absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_72%)]" />
      {/* soft green circle behind the phone */}
      <span className="absolute left-[calc(50%+255px)] top-1/2 hidden h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(209,240,143,.75)_0%,rgba(201,230,223,.55)_45%,transparent_70%)] lg:block" />
      <span className="absolute left-[calc(50%-260px)] top-[18%] hidden h-[220px] w-[220px] -translate-x-1/2 rounded-full bg-[#D1F08F]/35 blur-2xl lg:block" />

      {/* sparkles, paws and curls in the empty sides */}
      <span className="absolute inset-0 hidden lg:block">
        <Sparkle className="left-[7%] top-[18%] h-10 w-10" color={DECOR.bright} />
        <Sparkle className="left-[12%] top-[30%] h-4 w-4" color={DECOR.deep} delay={600} />
        <Sparkle className="left-[5%] bottom-[22%] h-6 w-6" color={DECOR.mint} delay={1200} />
        <Paw className="left-[10%] bottom-[12%] h-12 w-12 -rotate-12 opacity-80" color={DECOR.mint} />
        <Curl className="left-[16%] top-[10%] h-9 w-9 -scale-x-100 opacity-70" color={DECOR.bright} />
        <Sparkle className="right-[6%] top-[14%] h-12 w-12" color={DECOR.bright} delay={300} />
        <Sparkle className="right-[11%] top-[26%] h-4 w-4" color={DECOR.deep} delay={900} />
        <Sparkle className="right-[8%] bottom-[18%] h-7 w-7" color={DECOR.mint} delay={1500} />
        <Paw className="right-[4%] top-[52%] h-9 w-9 rotate-12 opacity-70" color={DECOR.bright} />
        <Curl className="right-[14%] bottom-[8%] h-10 w-10" color={DECOR.mint} />
      </span>
    </span>
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
            <p className="m-0 text-ink-body">ไม่ต้องเปิดเอกสารหลายสิบหน้า พิมพ์ชื่อกองแล้วน้อง Lensy สรุปให้</p>
          </>
        }
        steps={[
          ["พิมพ์ 2 กองในข้อความเดียว", "น้องวางค่าใช้จ่ายทุกชั้นเทียบกัน รวมถึงชั้นที่ Factsheet ไม่ได้แสดง"],
          ["พิมพ์ชื่อกองเดียว", "น้องเตือนความเสี่ยงที่มักมองข้าม เช่น ค่าเงิน และการลงทุนกระจุกตัว"],
          ["ถามว่าเสียกี่บาท", "น้องคำนวณให้ว่าแต่ละกองเสียค่าธรรมเนียมเป็นเงินเท่าไร และต่างกันเท่าไร"],
        ]}
        backdrop={<Backdrop />}
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

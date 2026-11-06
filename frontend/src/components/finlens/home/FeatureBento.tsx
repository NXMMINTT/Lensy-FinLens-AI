import Link from "next/link";

import { GENERAL_NOTE } from "@/lib/ask";
import { baht, pct, RISK_TAG, SAMPLE_ACTIVE, SAMPLE_CALC, SAMPLE_INDEX, SAMPLE_RISKS, sampleTrueCost } from "@/lib/sampleFunds";

import { PageRef } from "../chat";
import { TitleDecor } from "../Decor";
import { Lensy, LensyFace, type LensyPose } from "../Lensy";
import { SampleBadge } from "../SampleBadge";

/*
 * Four equal cards, each a short title + one line + a small scene: a document sheet rising from the
 * bottom edge (FinLens reads documents), a floating note, and Lensy peeking from a corner.
 * Every figure is from the sample funds, with its page.
 */

function Card({ title, text, href, children }: { title: string; text: string; href: string; children: React.ReactNode }) {
  return (
    <article className="relative flex flex-col overflow-hidden rounded-[24px] border border-line bg-brand-tint">
      <div className="flex flex-col gap-1.5 px-6 pt-6">
        <h3 className="m-0 text-[21px] font-bold leading-snug">
          <Link href={href} className="text-ink no-underline after:absolute after:inset-0 hover:text-brand">
            {title}
          </Link>
        </h3>
        <p className="m-0 text-[15px] text-ink-body">{text}</p>
      </div>
      <div className="force-light relative mt-4 h-[230px]">{children}</div>
    </article>
  );
}

/** A document page rising from the card's bottom edge, with a folded corner. */
function Sheet({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`absolute bottom-0 flex flex-col gap-2 rounded-t-2xl border border-b-0 border-[#DCE5DF] bg-white px-4 pb-3 pt-3.5 text-[#16301F] shadow-[0_-6px_24px_rgba(20,46,34,.08)] ${className}`}
      style={{ clipPath: "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)" }}
    >
      <span aria-hidden="true" className="absolute right-0 top-0 h-[22px] w-[22px] rounded-bl-md bg-[#E3EDE6]" />
      <b className="text-[12.5px] text-[#4A5E52]">{label}</b>
      {children}
    </div>
  );
}

function Note({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`absolute z-10 rounded-2xl px-3.5 py-2 text-[14px] font-bold shadow-[0_8px_20px_rgba(20,46,34,.12)] ${className}`}>{children}</div>;
}

function Peek({ pose, className = "" }: { pose: LensyPose; className?: string }) {
  return <Lensy pose={pose} size={118} className={`absolute bottom-[-10px] z-20 ${className}`} />;
}

/* ── 1. compare two funds ── */
function CompareScene() {
  const funds = [SAMPLE_ACTIVE, SAMPLE_INDEX] as const;
  const cost = funds.map((f) => Math.round(sampleTrueCost(f).feeCost));
  return (
    <>
      {funds.map((f, i) => (
        <Sheet key={f.code} label={`กอง ${i === 0 ? "A" : "B"}`} className={`h-[150px] w-[34%] ${i === 0 ? "left-[30%]" : "left-[63%]"}`}>
          <span className="text-[12px] leading-tight">ค่าใช้จ่ายระหว่างถือ</span>
          <b className="text-[18px] leading-none text-[#1A7637]">{f.masterFundExpense ? "2 ชั้น" : "1 ชั้น"}</b>
          <span className="text-[10px] text-[#7A8C81]">
            หน้า {f.ter.page} + หน้า {f.masterFundExpense?.page}
          </span>
        </Sheet>
      ))}
      <Note className="right-4 top-0 bg-[#9BE07A] text-[#0F2A12]">ต่างกัน {baht(Math.abs(cost[0] - cost[1]))} ใน 10 ปี</Note>
      <SampleBadge className="absolute left-6 top-2" />
      <Peek pose="magnifier" className="left-2" />
    </>
  );
}

/* ── 2. fee cost in baht ── */
function MoneyScene() {
  const f = SAMPLE_ACTIVE;
  const r = sampleTrueCost(f);
  return (
    <>
      <Sheet label={f.nameTh} className="left-[32%] h-[168px] w-[56%]">
        <span className="flex justify-between text-[12.5px]">
          <span>เงินลงทุน</span>
          <b>{SAMPLE_CALC.principal.toLocaleString("th-TH")} บาท</b>
        </span>
        <span className="flex justify-between text-[12.5px]">
          <span>ถือไว้</span>
          <b>{SAMPLE_CALC.years} ปี</b>
        </span>
        <span className="h-2 rounded-full bg-[#EEF2EF]">
          <span className="block h-full w-[62%] rounded-full bg-[#1A7637]" />
        </span>
        <span className="text-[10px] text-[#7A8C81]">สมมติผลตอบแทน {pct(SAMPLE_CALC.annualReturn, 0)} ต่อปี ไม่ใช่การคาดการณ์</span>
      </Sheet>
      <Note className="left-6 top-1 bg-white text-[#1A7637]">ปรับเงินและจำนวนปีได้</Note>
      <Note className="right-4 top-12 bg-[#1A7637] text-white">เสียค่าธรรมเนียม {baht(r.feeCost)}</Note>
      <Peek pose="coins" className="left-1" />
    </>
  );
}

/* ── 3. one fund explained ── */
function ExplainScene() {
  const f = SAMPLE_ACTIVE;
  const master = f.masterFundExpense!;
  return (
    <>
      <Sheet label="หนังสือชี้ชวน" className="left-[6%] h-[176px] w-[56%]">
        <span className="text-[12px] leading-snug">ค่าใช้จ่ายของกองทุนหลัก</span>
        <span className="self-start rounded bg-[#FFE7A3] px-1.5 text-[15px] font-extrabold">{pct(master.value)} ต่อปี</span>
        <span className="mt-1 flex flex-col gap-1">
          {SAMPLE_RISKS.slice(0, 2).map((r) => (
            <span key={r.topic} className="flex items-center gap-1.5 text-[12px]">
              <span className={`rounded-full border px-1.5 text-[10.5px] font-bold ${RISK_TAG[r.level].className}`}>{RISK_TAG[r.level].label}</span>
              {r.topic}
            </span>
          ))}
        </span>
        <span className="mt-auto text-[10px] text-[#7A8C81]">หน้า {master.page}</span>
      </Sheet>
      <Note className="right-[24%] top-3 max-w-[46%] bg-[#FFF4D1] text-[13px] text-[#7A5200]">⚠ ซ่อนในหนังสือชี้ชวน ไม่อยู่ใน Factsheet</Note>
      <Peek pose="checklist" className="right-2" />
    </>
  );
}

/* ── 4. ask Lensy ── */
function AskScene() {
  const f = SAMPLE_ACTIVE;
  return (
    <>
      <Note className="right-5 top-0 bg-[#9BE07A] text-[#0F2A12]">กองทุนฟีดเดอร์คืออะไร</Note>
      <div className="absolute left-[30%] right-4 top-14 z-10 flex items-end gap-1.5">
        <LensyFace size={28} />
        <span className="flex flex-col gap-1 rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-[13px] text-[#16301F] shadow-[0_8px_20px_rgba(20,46,34,.10)]">
          กองไทยที่ไปลงทุนต่อในกองต่างประเทศ เลยมีค่าใช้จ่าย 2 ชั้นค่ะ
          <span className="self-start rounded bg-[#EEF7F4] px-1.5 text-[10.5px] text-[#50685A]">{GENERAL_NOTE}</span>
        </span>
      </div>
      <Note className="bottom-6 right-5 bg-white text-[13px] font-semibold text-[#16301F]">
        กองนี้ TER {pct(f.ter.value)} <PageRef {...f.ter} />
      </Note>
      <Peek pose="idea" className="left-1" />
    </>
  );
}

export function FeatureBento() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 px-5 py-16 md:px-6">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="features-title" className="relative m-0 self-center text-[30px] font-bold leading-snug md:text-[38px]">
            <TitleDecor />
            น้อง Lensy <span className="marker-green">ช่วยอะไรได้บ้าง</span>
          </h2>
          <p className="m-0 text-ink-muted">ตัวเลขของกองบอกเลขหน้าในเอกสารทุกครั้ง เปิดตรวจเองได้</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Card href="/compare" title="เทียบ 2 กองเคียงกัน" text="วางค่าใช้จ่ายทุกชั้นเทียบกัน ชั้นที่ซ่อนอยู่ก็เห็น">
            <CompareScene />
          </Card>
          <Card href="/calculator" title="ค่าธรรมเนียมเป็นบาท" text="ไม่ใช่แค่เปอร์เซ็นต์ บอกเลยว่าเสียเงินไปกี่บาท คำนวณด้วยสูตร">
            <MoneyScene />
          </Card>
          <Card href="/explain" title="ดูทีละกองแบบเข้าใจง่าย" text="มีค่าใช้จ่ายอะไร ซ่อนอยู่หน้าไหน เสี่ยงเรื่องไหน">
            <ExplainScene />
          </Card>
          <Card href="/chat" title="ถามน้อง Lensy ได้เลย" text="ศัพท์การเงินอธิบายให้ ตัวเลขของกองตอบจากเอกสารเท่านั้น">
            <AskScene />
          </Card>
        </div>
      </div>
    </section>
  );
}

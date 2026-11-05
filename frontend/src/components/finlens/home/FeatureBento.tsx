import Link from "next/link";

import { GENERAL_NOTE } from "@/lib/ask";
import {
  baht,
  pct,
  RISK_TAG,
  SAMPLE_ACTIVE,
  SAMPLE_CALC,
  SAMPLE_INDEX,
  SAMPLE_RISKS,
  sampleAnnualCost,
  sampleTrueCost,
  type SampleFund,
  type SampleSourced,
} from "@/lib/sampleFunds";

import { PageRef } from "../chat";
import { Lensy, LensyFace, type LensyPose } from "../Lensy";
import { SampleBadge } from "../SampleBadge";
import { TitleDecor } from "../Decor";

function Card({
  id,
  name,
  title,
  text,
  pose,
  className = "",
  children,
}: {
  id?: string;
  name: string;
  title: string;
  text: string;
  pose: LensyPose;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <article id={id} className={`relative flex scroll-mt-24 flex-col gap-4 overflow-hidden rounded-[24px] border border-line bg-surface p-6 md:p-7 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold uppercase tracking-wider text-brand">{name}</span>
          <h3 className="m-0 text-[24px] font-bold leading-snug md:text-[26px]">{title}</h3>
          <p className="m-0 text-[15.5px] text-ink-body">{text}</p>
        </div>
        <Lensy pose={pose} size={84} className="-mr-2 -mt-2 shrink-0" />
      </div>
      <div className="mt-auto rounded-2xl bg-brand-tint p-4 text-[15px] md:p-5">{children}</div>
    </article>
  );
}

/** Fee layers of the two sample funds side by side (order A, B is fixed; not a ranking). */
const COMPARE_ROWS: { label: string; pick: (f: SampleFund) => SampleSourced<number> | null; hidden?: boolean }[] = [
  { label: "ค่าธรรมเนียมการขาย", pick: (f) => f.frontEnd },
  { label: "ค่าธรรมเนียมรับซื้อคืน", pick: (f) => f.backEnd },
  { label: "ค่าใช้จ่ายกองไทย (TER)", pick: (f) => f.ter },
  { label: "ค่าใช้จ่ายกองทุนหลัก", pick: (f) => f.masterFundExpense, hidden: true },
];

function CompareVisual() {
  const funds = [SAMPLE_ACTIVE, SAMPLE_INDEX] as const;
  const res = funds.map((f) => ({ f, annual: sampleAnnualCost(f), cost: Math.round(sampleTrueCost(f).feeCost) }));
  const diff = Math.abs(res[0].cost - res[1].cost);
  const row = "grid grid-cols-[1.4fr_1fr_1fr] items-center gap-x-3 py-2";
  return (
    <div className="grid gap-5 md:grid-cols-[1.6fr_1fr] md:items-center">
      <div className="flex flex-col text-[14.5px]">
        <div className={`${row} border-b border-line pt-0`}>
          <SampleBadge className="justify-self-start" />
          {funds.map((f, i) => (
            <b key={f.code} className="flex items-center gap-1.5 text-[14px]">
              <i className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${i === 0 ? "bg-brand" : "bg-brand-light"}`} />
              กอง {i === 0 ? "A" : "B"}
            </b>
          ))}
        </div>
        {COMPARE_ROWS.map((r) => (
          <div key={r.label} className={`${row} border-b border-line-subtle ${r.hidden ? "-mx-2 rounded-lg bg-sun-soft px-2" : ""}`}>
            <span className="flex flex-col leading-snug">
              {r.label}
              {r.hidden && <span className="text-[12px] font-bold text-sun-ink">⚠ ซ่อนในหนังสือชี้ชวน</span>}
            </span>
            {funds.map((f) => {
              const v = r.pick(f);
              return v ? (
                <span key={f.code} className="flex flex-col leading-tight">
                  <b>{pct(v.value)}</b>
                  <PageRef {...v} />
                </span>
              ) : (
                <span key={f.code} className="text-[12px] text-ink-muted">
                  ไม่พบในเอกสาร
                </span>
              );
            })}
          </div>
        ))}
        <div className={`${row} pb-0`}>
          <b>ต้นทุนต่อปีรวม</b>
          {res.map(({ f, annual }) => (
            <b key={f.code} className="text-[18px] text-brand">
              {pct(annual)}
            </b>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
        <span className="text-[14px] font-semibold">
          ลงทุน {SAMPLE_CALC.principal.toLocaleString("th-TH")} บาท ถือ {SAMPLE_CALC.years} ปี เสียค่าธรรมเนียม
        </span>
        {res.map(({ f, cost }, i) => (
          <span key={f.code} className="flex items-baseline justify-between gap-2">
            <span>กอง {i === 0 ? "A" : "B"}</span>
            <b className="text-[17px]">{baht(cost)}</b>
          </span>
        ))}
        <span className="flex items-baseline justify-between gap-2 border-t border-line pt-2">
          <span className="font-semibold">ต่างกัน</span>
          <b className="text-[22px] leading-none text-brand">{baht(diff)}</b>
        </span>
        <span className="text-[12px] text-ink-muted">
          สมมติผลตอบแทน {pct(SAMPLE_CALC.annualReturn, 0)} ต่อปี ไม่ใช่การคาดการณ์ · คำนวณด้วยสูตร · ไม่ได้บอกว่ากองไหนดีกว่า
        </span>
        <Link href="/compare" className="text-[14px] font-bold text-brand underline-offset-4 hover:underline">
          เทียบกองทุนจริง →
        </Link>
      </div>
    </div>
  );
}

/** One question per block: what it costs, how many baht, what risks — all for one sample fund. */
function FundExplainVisual() {
  const f = SAMPLE_ACTIVE;
  const master = f.masterFundExpense!;
  const total = sampleAnnualCost(f);
  const cost = sampleTrueCost(f).feeCost;
  const Q = ({ children }: { children: React.ReactNode }) => <span className="text-[13px] font-bold text-brand">{children}</span>;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <b className="text-[16px]">{f.nameTh}</b>
        <SampleBadge />
      </div>

      <div className="flex flex-col gap-2">
        <Q>มีค่าใช้จ่ายอะไร</Q>
        <div className="flex items-baseline justify-between gap-2">
          <span>ต้นทุนต่อปีรวม</span>
          <b className="text-[24px] leading-none text-brand">{pct(total)}</b>
        </div>
        <div className="flex h-4 overflow-hidden rounded-full">
          <span className="bg-brand" style={{ width: `${(f.ter.value / total) * 100}%` }} />
          <span className="bg-sun" style={{ width: `${(master.value / total) * 100}%` }} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
          <span className="flex flex-wrap items-center gap-x-1.5">
            <i className="inline-block h-3 w-3 rounded-full bg-brand" /> กองไทย (TER) <b>{pct(f.ter.value)}</b> <PageRef {...f.ter} />
          </span>
          <span className="flex flex-wrap items-center gap-x-1.5">
            <i className="inline-block h-3 w-3 rounded-full bg-sun" /> กองหลัก <b>{pct(master.value)}</b> <PageRef {...master} />
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t border-line pt-3">
        <Q>เสียเงินไปกี่บาท</Q>
        <div className="flex items-baseline justify-between gap-2">
          <span>
            ลงทุน {SAMPLE_CALC.principal.toLocaleString("th-TH")} บาท ถือ {SAMPLE_CALC.years} ปี
          </span>
          <b className="text-[22px] leading-none">{baht(cost)}</b>
        </div>
        <span className="text-[12.5px] text-ink-muted">
          สมมติผลตอบแทน {pct(SAMPLE_CALC.annualReturn, 0)} ต่อปี ไม่ใช่การคาดการณ์ · คำนวณด้วยสูตร
        </span>
      </div>

      <div className="flex flex-col gap-2 border-t border-line pt-3">
        <Q>มีความเสี่ยงอะไร</Q>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {SAMPLE_RISKS.slice(0, 3).map((r) => (
            <li key={r.topic} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className={`whitespace-nowrap rounded-full border px-2.5 text-[13px] font-bold ${RISK_TAG[r.level].className}`}>{RISK_TAG[r.level].label}</span>
                {r.topic}
              </span>
              <PageRef page={r.page} source={r.source} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Bot({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex max-w-[94%] items-end gap-1.5 self-start">
      <LensyFace size={28} />
      <span className="flex flex-col gap-1 rounded-2xl rounded-bl-sm bg-surface px-3 py-2">{children}</span>
    </span>
  );
}

function User({ children }: { children: React.ReactNode }) {
  return <span className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-chat px-3 py-1.5 text-[#0F2A12]">{children}</span>;
}

/** General knowledge (labelled), a fund figure (with its page), and a polite refusal. */
function AskVisual() {
  const f = SAMPLE_ACTIVE;
  return (
    <div className="flex flex-col gap-2.5">
      <User>กองทุนฟีดเดอร์คืออะไร</User>
      <Bot>
        <span>กองไทยที่นำเงินไปลงทุนต่อในกองต่างประเทศอีกที (กองทุนหลัก) จึงมีค่าใช้จ่าย 2 ชั้นค่ะ</span>
        <span className="self-start rounded-md bg-sky px-1.5 text-[11.5px] text-ink-muted">{GENERAL_NOTE}</span>
      </Bot>
      <User>{f.nameTh} มีค่าใช้จ่ายกองหลักไหม</User>
      <Bot>
        <span>
          มีค่ะ {pct(f.masterFundExpense!.value)} ต่อปี อยู่ในหนังสือชี้ชวน ไม่อยู่ใน Factsheet <PageRef {...f.masterFundExpense!} />
        </span>
      </Bot>
      <User>ควรซื้อไหม</User>
      <Bot>
        <span>น้องแนะนำให้ซื้อหรือขายไม่ได้ค่ะ แต่ช่วยเทียบข้อมูลให้ดูได้นะคะ</span>
      </Bot>
    </div>
  );
}

export function FeatureBento() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 px-5 py-16 md:px-6">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="features-title" className="relative m-0 self-center text-[30px] font-bold leading-snug md:text-[40px]">
            <TitleDecor />
            น้อง Lensy <span className="marker-green">ช่วยอะไรได้บ้าง</span>
          </h2>
          <p className="m-0 text-ink-muted">ตัวเลขของกองบอกเลขหน้าในเอกสารทุกครั้ง เปิดตรวจเองได้</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card
            id="compare"
            className="lg:col-span-2"
            name="เทียบกองทุน · ฟีเจอร์หลัก"
            title="เทียบ 2 กองเคียงกัน เห็นค่าธรรมเนียมแฝง"
            text="ค่าใช้จ่ายทุกชั้นวางเทียบทีละบรรทัด ชั้นที่ซ่อนอยู่ในหนังสือชี้ชวนก็เห็น พร้อมส่วนต่างเป็นบาท"
            pose="magnifier"
          >
            <CompareVisual />
          </Card>
          <Card
            name="อธิบายทีละกอง"
            title="กองนี้มีค่าใช้จ่ายอะไร เสียกี่บาท เสี่ยงเรื่องไหน"
            text="สรุปจาก Factsheet และหนังสือชี้ชวนเป็นภาษาง่าย ความเสี่ยงสร้างจากกฎ ไม่ใช่ AI ตัดสิน"
            pose="checklist"
          >
            <FundExplainVisual />
          </Card>
          <Card
            name="ถามน้อง Lensy"
            title="ถามเรื่องการเงินได้เลย"
            text="ศัพท์ยากหรือแนวคิดการเงิน น้องอธิบายให้ ตัวเลขของกองตอบจากเอกสารเท่านั้น ถ้าไม่มีจะบอกว่า “ไม่พบข้อมูลนี้ในเอกสาร”"
            pose="idea"
          >
            <AskVisual />
          </Card>
        </div>
      </div>
    </section>
  );
}

import { SAMPLE_DATA_LABEL } from "@/lib/disclaimer";
import { baht, pct, RISK_TAG, SAMPLE_ACTIVE, SAMPLE_CALC, SAMPLE_INDEX, SAMPLE_RISKS, sampleAnnualCost, sampleTrueCost } from "@/lib/sampleFunds";

import { PageRef } from "../chat";
import { Lensy, LensyFace, type LensyPose } from "../Lensy";
import { SampleBadge } from "../SampleBadge";
import { TitleDecor } from "../Decor";

function Card({
  name,
  title,
  text,
  pose,
  className = "",
  children,
}: {
  name: string;
  title: string;
  text: string;
  pose: LensyPose;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <article className={`relative flex flex-col gap-4 overflow-hidden rounded-[24px] border border-line bg-surface p-6 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold uppercase tracking-wider text-brand">{name}</span>
          <h3 className="m-0 text-[24px] font-bold leading-snug">{title}</h3>
          <p className="m-0 text-[15.5px] text-ink-body">{text}</p>
        </div>
        <Lensy pose={pose} size={76} className="-mr-2 -mt-2" />
      </div>
      <div className="mt-auto rounded-2xl bg-brand-tint p-4 text-[14px]">{children}</div>
    </article>
  );
}

function FeeVisual() {
  const f = SAMPLE_ACTIVE;
  const master = f.masterFundExpense!;
  const total = sampleAnnualCost(f);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <SampleBadge />
        <span>
          รวม <b className="text-[20px] text-brand">{pct(total)}</b> ต่อปี
        </span>
      </div>
      <div className="flex h-4 overflow-hidden rounded-full">
        <span className="bg-brand" style={{ width: `${(f.ter.value / total) * 100}%` }} />
        <span className="bg-sun" style={{ width: `${(master.value / total) * 100}%` }} />
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        <span className="flex flex-wrap items-center gap-x-2">
          <i className="inline-block h-2.5 w-2.5 rounded-full bg-brand" /> กองไทย (TER) <b>{pct(f.ter.value)}</b> <PageRef {...f.ter} />
        </span>
        <span className="flex flex-wrap items-center gap-x-2">
          <i className="inline-block h-2.5 w-2.5 rounded-full bg-sun" /> กองหลัก <b>{pct(master.value)}</b> <PageRef {...master} />
        </span>
      </div>
    </div>
  );
}

function RiskVisual() {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {SAMPLE_RISKS.slice(0, 3).map((r) => (
        <li key={r.topic} className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className={`whitespace-nowrap rounded-full border px-2 text-[12px] font-bold ${RISK_TAG[r.level].className}`}>{RISK_TAG[r.level].label}</span>
            {r.topic}
          </span>
          <PageRef page={r.page} source={r.source} />
        </li>
      ))}
    </ul>
  );
}

function CostVisual() {
  const rows = [SAMPLE_ACTIVE, SAMPLE_INDEX].map((f) => ({ f, cost: sampleTrueCost(f).feeCost }));
  const max = Math.max(...rows.map((x) => x.cost));
  return (
    <div className="flex flex-col gap-2">
      {rows.map(({ f, cost }, i) => (
        <div key={f.code} className="flex flex-col gap-1">
          <div className="flex justify-between gap-2">
            <span>{f.nameTh}</span>
            <b>{baht(cost)}</b>
          </div>
          <div className="h-2.5 rounded-full bg-line-subtle">
            <div className={`h-full rounded-full ${i === 0 ? "bg-brand" : "bg-brand-light"}`} style={{ width: `${(cost / max) * 100}%` }} />
          </div>
        </div>
      ))}
      <span className="text-[12px] text-ink-muted">
        {SAMPLE_CALC.principal.toLocaleString("th-TH")} บาท {SAMPLE_CALC.years} ปี สมมติผลตอบแทน {pct(SAMPLE_CALC.annualReturn, 0)} ต่อปี · {SAMPLE_DATA_LABEL}
      </span>
    </div>
  );
}

function ExplainVisual() {
  const f = SAMPLE_ACTIVE;
  return (
    <div className="flex flex-col gap-2">
      <span className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-chat px-3 py-1.5 text-[#0F2A12]">TER คืออะไร</span>
      <span className="flex max-w-[92%] items-end gap-1.5 self-start">
        <LensyFace size={26} />
        <span className="rounded-2xl rounded-bl-sm bg-surface px-3 py-1.5">
          ค่าใช้จ่ายรวมที่กองหักจากเงินกองทุนทุกปีค่ะ กองนี้ {pct(f.ter.value)} <PageRef {...f.ter} />
        </span>
      </span>
      <span className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-chat px-3 py-1.5 text-[#0F2A12]">ควรซื้อไหม</span>
      <span className="flex max-w-[92%] items-end gap-1.5 self-start">
        <LensyFace size={26} />
        <span className="rounded-2xl rounded-bl-sm bg-surface px-3 py-1.5">น้องแนะนำให้ซื้อหรือขายไม่ได้ค่ะ แต่ช่วยเทียบข้อมูลให้ดูได้นะคะ</span>
      </span>
    </div>
  );
}

export function FeatureBento() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 px-5 py-16 md:px-6">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="features-title" className="relative m-0 self-center text-[30px] font-bold md:text-[40px]">
            <TitleDecor />
            น้อง Lensy <span className="marker-green">ส่องให้ 4 เรื่อง</span>
          </h2>
          <p className="m-0 text-ink-muted">ทุกตัวเลขบอกเลขหน้าในเอกสาร เปิดตรวจเองได้</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-5">
          <Card
            className="lg:col-span-3"
            name="Hidden Fee Detector"
            title="ค่าธรรมเนียมที่ซ่อนอยู่"
            text="กองที่ไปลงทุนต่อในกองต่างประเทศมีค่าใช้จ่ายสองชั้น น้องรวมให้ครบทุกชั้น"
            pose="magnifier"
          >
            <FeeVisual />
          </Card>
          <Card
            className="lg:col-span-2"
            name="Risk Alert"
            title="ความเสี่ยงที่มักถูกมองข้าม"
            text="ค่าเงิน ตลาดต่างประเทศ การกระจุกตัว เงื่อนไขขายคืน สร้างจากกฎ ไม่ใช่ AI ตัดสิน"
            pose="checklist"
          >
            <RiskVisual />
          </Card>
          <Card
            className="lg:col-span-2"
            name="True Cost Calculator"
            title="ค่าธรรมเนียมเป็นบาท"
            text="เทียบได้ 2–3 กอง ปรับเงินและจำนวนปีเองได้ คำนวณด้วยสูตร"
            pose="chart"
          >
            <CostVisual />
          </Card>
          <Card
            className="lg:col-span-3"
            name="AI Explain"
            title="ถามศัพท์ยาก ๆ ได้เลย"
            text="ตอบจากเอกสารของกองนั้นเท่านั้น ถ้าไม่มีจะบอกว่า “ไม่พบข้อมูลนี้ในเอกสาร”"
            pose="idea"
          >
            <ExplainVisual />
          </Card>
        </div>
      </div>
    </section>
  );
}

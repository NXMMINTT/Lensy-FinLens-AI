import Link from "next/link";

import { LineAddFriendButton } from "@/components/brand/LineAddFriendButton";
import { NOT_FOUND, SAMPLE_DATA_LABEL } from "@/lib/disclaimer";
import { pct, SAMPLE_ACTIVE as F, sampleAnnualCost } from "@/lib/sampleFunds";

import { AnswerCard } from "./chat";
import { Disclaimer } from "./Disclaimer";
import { Icon } from "./Icon";
import { DocumentLens } from "./home/DocumentLens";
import { HeroDecor, HeroTextDecor, MascotDecor, TitleDecor } from "./Decor";
import { Lensy, LensyFace } from "./Lensy";
import { FinLensLogo } from "./Logo";

/* ── Hero: the magnifier over the documents ── */

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative bg-surface">
      <div className="mx-auto grid max-w-[1200px] items-center gap-x-10 gap-y-12 px-5 pb-16 pt-10 md:px-6 lg:min-h-[min(calc(100svh-66px),780px)] lg:grid-cols-[1.05fr_1fr] lg:py-10">
        <div className="relative flex min-w-0 flex-col gap-5">
          <HeroTextDecor />
          <span className="self-start rounded-md border border-brand/30 bg-surface px-3 py-1 text-[14px] font-semibold text-brand">
            <Icon name="search" className="mr-1.5" />
            ผู้ช่วยอ่านเอกสารกองทุนรวม ใน LINE
          </span>
          <h1 id="hero-title" className="m-0 text-[34px] font-bold leading-[1.3] tracking-tight sm:text-[44px] md:text-[52px]">
            ส่องค่าธรรมเนียม
            <br />
            <span className="marker-green">ที่ซ่อนอยู่</span> ในเอกสารกองทุน
          </h1>
          <p className="m-0 max-w-[540px] text-lg text-ink-body">
            Factsheet กับหนังสือชี้ชวนยาวหลายสิบหน้า น้อง Lensy อ่านให้ แล้วบอกเป็นภาษาง่าย ๆ ว่าเสียค่าอะไร เป็นเงินกี่บาท เสี่ยงเรื่องไหน
            พร้อมเลขหน้าที่มาทุกครั้ง
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <LineAddFriendButton label="เพิ่มเพื่อนน้อง Lensy" />
            <Link href="/funds" className="inline-flex min-h-[52px] items-center rounded-full border-2 border-brand px-6 font-bold text-brand no-underline hover:bg-brand-soft">
              ลองใช้บนเว็บ
            </Link>
          </div>
          <Disclaimer />
        </div>
        <div className="relative flex justify-center px-2 lg:justify-end">
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[min(520px,95vw)] w-[min(520px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-soft via-brand-tint to-surface lg:left-[55%]" />
          <HeroDecor />
          <DocumentLens />
        </div>
      </div>
    </section>
  );
}

/** Says out loud that every figure on the page is made up. */
export function SampleNotice() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-y border-line bg-surface px-5 py-3 text-center text-[15px] text-ink-muted">
      <span className="rounded-full border border-dashed border-sun-ink/50 bg-sun-soft px-2 py-0.5 text-[12px] font-bold text-sun-ink">{SAMPLE_DATA_LABEL}</span>
      กองทุนและตัวเลขในหน้านี้สร้างขึ้นเพื่อสาธิตการทำงาน ไม่ใช่กองทุนจริง
    </div>
  );
}

/* ── How it works: 3 steps ── */

export function HowItWorks() {
  const steps = [
    {
      no: 1,
      title: "พิมพ์ชื่อกองทุน",
      text: "ใน LINE หรือบนเว็บ จะถามเป็นประโยคก็ได้",
      body: <span className="rounded-2xl rounded-br-sm bg-chat px-3 py-1.5 text-[#0F2A12]">{F.nameTh} มีค่าใช้จ่ายอะไรบ้าง</span>,
    },
    {
      no: 2,
      title: "น้อง Lensy อ่านเอกสาร",
      text: "ดึงค่าจาก Factsheet และหนังสือชี้ชวน ทีมตรวจทีละค่าก่อนใช้จริง",
      body: (
        <span className="flex flex-wrap gap-1.5">
          {["Factsheet หน้า 1–3", "หนังสือชี้ชวน หน้า 9–14"].map((t) => (
            <span key={t} className="rounded-md border border-line bg-brand-tint px-2 py-1 text-[13px]">
              <Icon name="doc" size={14} className="mr-1 text-brand" />
              {t}
            </span>
          ))}
        </span>
      ),
    },
    {
      no: 3,
      title: "ได้การ์ดคำตอบ",
      text: "สั้น อ่านง่าย ทุกตัวเลขมีเลขหน้า",
      body: (
        <div className="force-light w-full text-[12px]">
          <AnswerCard title="ต้นทุนต่อปีรวม">
            <div className="flex items-center justify-between gap-2">
              <b className="text-[18px] text-brand">{pct(sampleAnnualCost(F))}</b>
              <span className="text-[10px] text-ink-muted">
                หน้า {F.ter.page} + หน้า {F.masterFundExpense?.page}
              </span>
            </div>
          </AnswerCard>
        </div>
      ),
    },
  ];
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-20 bg-surface px-5 py-16 md:px-6">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-8">
        <h2 id="how-title" className="relative m-0 self-center text-center text-[30px] font-bold md:text-[40px]">
          <TitleDecor />
          ใช้ง่าย <span className="marker-green">3 ขั้น</span>
        </h2>
        <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.no} className="relative flex flex-col gap-3 rounded-[24px] border border-line bg-surface p-6">
              <span className="font-heading text-[44px] font-bold leading-none text-brand/25">0{s.no}</span>
              <h3 className="m-0 text-[22px] font-bold">{s.title}</h3>
              <p className="m-0 text-ink-body">{s.text}</p>
              <div className="mt-auto flex min-h-[64px] items-end">{s.body}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Promises: what Lensy will and won't do (Responsible AI) ── */

export function Promises() {
  const wont = ["เชียร์ให้ซื้อหรือขาย", "จัดอันดับว่ากองไหนดีกว่า", "คาดการณ์ผลตอบแทนในอนาคต", "เดาตัวเลขที่เอกสารไม่มี"];
  const will = ["บอกเลขหน้าที่มาของทุกตัวเลข", `บอกตรง ๆ ว่า “${NOT_FOUND}”`, "คิดตัวเลขเงินด้วยสูตร ไม่ใช่ AI", "เก็บข้อมูลส่วนตัวเท่าที่จำเป็น"];
  return (
    <section aria-labelledby="promise-title" className="bg-navy px-5 py-16 text-white md:px-6">
      <div className="mx-auto grid max-w-[1100px] items-center gap-10 lg:grid-cols-[auto_1fr]">
        <span className="relative mx-auto">
          <Lensy pose="shield" size={170} className="max-sm:!h-[120px] max-sm:!w-[120px]" />
          <MascotDecor light />
        </span>
        <div className="flex flex-col gap-6">
          <h2 id="promise-title" className="m-0 text-[30px] font-bold md:text-[38px]">
            สัญญาของน้อง Lensy
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <b className="text-[#D1F08F]">น้องจะไม่…</b>
              {wont.map((t) => (
                <span key={t} className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[13px]" aria-hidden="true">
                    ✕
                  </span>
                  {t}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              <b className="text-[#D1F08F]">น้องจะ…</b>
              {will.map((t) => (
                <span key={t} className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-[13px] font-bold text-navy" aria-hidden="true">
                    ✓
                  </span>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Pricing: comparison table ── */

const PLAN_ROWS: [string, boolean, boolean][] = [
  ["ตรวจค่าธรรมเนียมแฝง", true, true],
  ["แจ้งเตือนความเสี่ยงที่อาจมองข้าม", true, true],
  ["คำนวณต้นทุนเป็นบาท เทียบ 2–3 กอง", true, true],
  ["ถามน้อง Lensy ผ่าน LINE และเว็บ", true, true],
  ["ส่องพอร์ต: รวมค่าใช้จ่ายและความเสี่ยงทุกกองที่ถือ", false, true],
  ["เช็กก่อนเชื่อ: เทียบข้อความโฆษณากองทุนกับเอกสารจริง", false, true],
];

export function PricingTable() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 px-5 py-16 md:px-6">
      <div className="mx-auto flex max-w-[900px] flex-col gap-8">
        <div className="text-center">
          <h2 id="pricing-title" className="relative m-0 inline-block text-[30px] font-bold md:text-[40px]">
            <TitleDecor />
            ฟีเจอร์หลัก<span className="marker-green">ใช้ฟรี</span>
          </h2>
          <p className="m-0 mt-2 text-ink-muted">Premium สำหรับคนที่อยากดูทั้งพอร์ต · ช่วงเดโมยังไม่เปิดรับชำระเงิน</p>
        </div>
        <div className="overflow-x-auto rounded-[24px] border border-line bg-surface">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="p-5 align-bottom text-[15px] font-semibold text-ink-muted">ฟีเจอร์</th>
                <th className="w-[150px] p-5 text-center">
                  <div className="text-[18px] font-bold">ฟรี</div>
                  <div className="font-heading text-[30px] font-bold">฿0</div>
                </th>
                <th className="w-[170px] bg-brand-soft/60 p-5 text-center">
                  <div className="flex items-center justify-center gap-2 text-[18px] font-bold text-brand">
                    Premium <span className="whitespace-nowrap rounded-full bg-sun px-2 py-0.5 text-[11px] text-[#4A3500]">เร็ว ๆ นี้</span>
                  </div>
                  <div className="font-heading text-[30px] font-bold">
                    ฿99<span className="text-[15px] font-medium text-ink-muted"> / เดือน</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {PLAN_ROWS.map(([label, free, premium]) => (
                <tr key={label} className="border-b border-line-subtle last:border-0">
                  <td className="px-5 py-3.5">{label}</td>
                  {[free, premium].map((on, i) => (
                    <td key={i} className={`px-5 py-3.5 text-center ${i === 1 ? "bg-brand-soft/60" : ""}`}>
                      {on ? (
                        <span className="font-bold text-brand" aria-label="มี">
                          ✓
                        </span>
                      ) : (
                        <span className="text-ink-faint" aria-label="ไม่มี">
                          —
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ: accordion ── */

const FAQ: [string, string][] = [
  ["FinLens AI คืออะไร", "ผู้ช่วยอ่านเอกสารกองทุนรวมค่ะ น้อง Lensy สรุปค่าใช้จ่าย ความเสี่ยง และต้นทุนเป็นบาท จาก Fund Factsheet และหนังสือชี้ชวน พร้อมบอกเลขหน้าที่มา"],
  ["ข้อมูลมาจากไหน เชื่อได้แค่ไหน", "มาจากเอกสารทางการของกองทุนค่ะ ทุกค่ามีเลขหน้าให้เปิดตรวจเอง และทีมตรวจทีละค่าเทียบกับเอกสารก่อนนำมาแสดง ถ้าเอกสารไม่มีข้อมูล น้องจะบอกว่าไม่พบ ไม่เดา"],
  ["บอกได้ไหมว่ากองไหนดีที่สุด", "น้องไม่แนะนำให้ซื้อหรือขาย และไม่จัดอันดับกองทุนค่ะ แต่ช่วยวางค่าใช้จ่ายและความเสี่ยงของแต่ละกองเทียบกันให้ดูได้"],
  ["ตัวเลขเป็นบาทคำนวณยังไง", "คำนวณด้วยสูตรในระบบ ไม่ได้ให้ AI คิดค่ะ ใช้ค่าธรรมเนียมจากเอกสาร กับผลตอบแทนสมมติที่ปรับเองได้ (ค่าเริ่มต้น 6% ต่อปี) ซึ่งเป็นสมมติฐาน ไม่ใช่การคาดการณ์"],
  ["ต้องโหลดแอปเพิ่มไหม", "ไม่ต้องค่ะ เพิ่มเพื่อนน้อง Lensy ใน LINE แล้วพิมพ์ชื่อกองทุนได้เลย หน้าเว็บก็เปิดจาก LINE ได้"],
  ["เก็บข้อมูลส่วนตัวอะไรบ้าง", "เก็บเท่าที่จำเป็นค่ะ ไม่ขอชื่อ เบอร์โทร หรือข้อมูลบัญชี และรหัสผู้ใช้ LINE ถูกแปลงเป็นรหัสที่ย้อนกลับไม่ได้ (hash) ก่อนบันทึก"],
];

export function FaqAccordion() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 bg-surface px-5 py-16 md:px-6">
      <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col items-start gap-3">
          <h2 id="faq-title" className="m-0 text-[30px] font-bold leading-tight md:text-[40px]">
            คำถามที่พบบ่อย
          </h2>
          <p className="m-0 text-ink-muted">ไม่เจอคำตอบ ถามน้อง Lensy ใน LINE ได้เลยค่ะ</p>
          <span className="relative mt-2 max-lg:hidden">
            <Lensy pose="question" size={150} />
            <MascotDecor />
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-line bg-surface open:shadow-[0_6px_20px_rgba(20,46,34,.06)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                {q}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="m-0 flex gap-2.5 px-5 pb-4 text-ink-body">
                <LensyFace size={28} />
                <span>{a}</span>
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Closing CTA + footer ── */

export function StartCta() {
  return (
    <section aria-label="เริ่มใช้งาน" className="px-5 py-16 md:px-6">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-8 rounded-[28px] bg-gradient-to-br from-brand to-brand-dark px-8 py-10 text-white md:px-12">
        <div className="flex flex-col gap-3">
          <h2 className="m-0 text-[28px] font-bold leading-snug md:text-[36px]">
            ก่อนกดซื้อกองไหน
            <br />
            ให้น้อง Lensy ส่องให้ก่อน
          </h2>
          <p className="m-0 opacity-90">เพิ่มเพื่อนใน LINE แล้วพิมพ์ชื่อกองทุนได้เลยค่ะ</p>
          <LineAddFriendButton label="เพิ่มเพื่อนน้อง Lensy" className="mt-2 self-start" />
        </div>
        <span className="relative max-sm:hidden">
          <Lensy pose="wave" size={170} className="animate-bob" />
          <MascotDecor light />
        </span>
      </div>
    </section>
  );
}

export function LandingFooter({ sampleNote = true }: { sampleNote?: boolean } = {}) {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-8 text-[15px] md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <FinLensLogo height={38} />
            <div className="text-ink-muted">เข้าใจกองทุนก่อนตัดสินใจ ทุกคำตอบมีเลขหน้าที่มา</div>
          </div>
          <div className="text-ink-muted">Trinity Hackathon 2026</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <Disclaimer className="font-semibold text-ink-body" />
          {sampleNote && <span className="text-ink-muted">ข้อมูลกองทุนในหน้านี้เป็น{SAMPLE_DATA_LABEL}</span>}
        </div>
      </div>
    </footer>
  );
}

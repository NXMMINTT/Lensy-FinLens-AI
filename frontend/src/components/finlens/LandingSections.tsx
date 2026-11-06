import Link from "next/link";
import { LineAddFriendButton } from "@/components/brand/LineAddFriendButton";
import { thaiDate } from "@/lib/dataStatus";
import { NOT_FOUND } from "@/lib/disclaimer";
import { homeFunds } from "@/lib/homeFunds";
import { SOURCE_LABEL, sourceRef } from "@/lib/sources";

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
            ผู้ช่วยการเงิน ใน LINE และเว็บ
          </span>
          <h1 id="hero-title" className="m-0 text-[32px] font-bold leading-[1.3] tracking-tight sm:text-[42px] md:text-[48px]">
            ผู้ช่วยการเงินที่ทำให้เห็น
            <br />
            <span className="marker-green-strong whitespace-nowrap">ค่าใช้จ่ายที่มองไม่เห็น</span>
          </h1>
          <p className="m-0 max-w-[540px] text-lg text-ink-body">
            ถามเรื่องการเงินได้ทุกเรื่องด้วยภาษาง่าย ๆ หรือให้น้อง Lensy เทียบ 2 กองให้ดูว่ามีค่าใช้จ่ายอะไรซ่อนอยู่ และต่างกันกี่บาท
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <LineAddFriendButton label="เพิ่มเพื่อนน้อง Lensy" />
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

/** Says where the examples on the page come from: the two real funds, their date and documents. */
export function DataNotice() {
  const [A, B] = homeFunds();
  const dates = [...new Set([A.asOfDate, B.asOfDate].filter((d): d is string => Boolean(d)))];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-y border-line bg-surface px-5 py-3 text-center text-[15px] text-ink-muted">
      <span className="rounded-full border border-brand/30 bg-brand-soft px-2 py-0.5 text-[12px] font-bold text-brand">ข้อมูลกองจริง</span>
      ตัวอย่างในหน้านี้คือ {A.code} กับ {B.code}
      {dates.length > 0 && ` ข้อมูล ณ ${dates.map(thaiDate).join(", ")}`} จาก Factsheet ของ บลจ. และเอกสารของกองหลัก ตัวเลขเงินบาทคำนวณจากสมมติฐาน
    </div>
  );
}

/* ── How it works: 3 steps ── */

export function HowItWorks() {
  const [A, B] = homeFunds();
  const steps = [
    {
      no: 1,
      title: "พิมพ์ชื่อกองที่ลังเล",
      text: "ใส่ 2 กองในข้อความเดียวได้ ทั้งใน LINE และบนเว็บ",
      body: (
        <span className="rounded-2xl rounded-br-sm bg-chat px-3 py-1.5 text-[#0F2A12]">
          {A.code} กับ {B.code}
        </span>
      ),
    },
    {
      no: 2,
      title: "น้อง Lensy อ่านเอกสารทั้งสองกอง",
      text: "ดึงค่าจาก Factsheet ของกองไทย และเอกสารของกองหลักต่างประเทศ ทุกตัวเลขบอกที่มา",
      body: (
        <span className="flex flex-wrap gap-1.5">
          {[A, B].map((f) => `${f.code} · Factsheet${f.masterFundExpense ? ` + ${SOURCE_LABEL[f.masterFundExpense.source]}` : ""}`).map((t) => (
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
      title: "เห็นค่าใช้จ่ายเทียบกัน",
      text: "ทุกชั้นเคียงกัน ส่วนต่างเป็นบาท",
      body: (
        <div className="force-light w-full text-[12px]">
          <AnswerCard title="ค่าใช้จ่ายทุกชั้น">
            <div className="flex flex-col gap-1">
              {[A, B].map((f) => (
                <div key={f.code} className="flex items-center justify-between gap-2">
                  <span>{f.code}</span>
                  <span className="text-right text-[11px] text-ink-muted">
                    กองไทย {sourceRef(f.ter.page, f.ter.source)}
                    {f.masterFundExpense ? ` + กองหลัก ${sourceRef(f.masterFundExpense.page, f.masterFundExpense.source)}` : ""}
                  </span>
                </div>
              ))}
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
  const will = ["บอกที่มาของทุกตัวเลข เปิดเอกสารต้นฉบับได้", `บอกตรง ๆ ว่า “${NOT_FOUND}”`, "คิดตัวเลขเงินด้วยสูตร ไม่ใช่ AI", "เก็บข้อมูลส่วนตัวเท่าที่จำเป็น"];
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

/* ── Pricing: two plan cards ── */

const FREE_FEATURES = [
  "เทียบค่าธรรมเนียมทุกชั้นของ 2–3 กองเคียงกัน",
  "คำนวณส่วนต่างเป็นบาท ปรับเงินและจำนวนปีเองได้",
  "อธิบายทีละกอง: ค่าใช้จ่าย เสียกี่บาท ความเสี่ยง",
  "ถามน้อง Lensy เรื่องการเงิน ผ่าน LINE และเว็บ",
];
const PREMIUM_FEATURES = ["ส่องพอร์ต: รวมค่าใช้จ่ายและความเสี่ยงทุกกองที่ถือ", "เช็กก่อนเชื่อ: เทียบข้อความโฆษณากับเอกสารจริง"];

function Check({ light = false }: { light?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${light ? "bg-white text-brand" : "bg-brand-soft text-brand"}`}
    >
      ✓
    </span>
  );
}

export function PricingTable() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 px-5 py-16 md:px-6">
      <div className="mx-auto flex max-w-[920px] flex-col gap-8">
        <div className="text-center">
          <h2 id="pricing-title" className="relative m-0 inline-block text-[30px] font-bold md:text-[38px]">
            <TitleDecor />
            ฟีเจอร์หลัก<span className="marker-green">ใช้ฟรี</span>
          </h2>
          <p className="m-0 mt-2 text-ink-muted">เทียบกองทุนได้ครบโดยไม่ต้องจ่าย Premium สำหรับคนที่ถือหลายกอง</p>
        </div>

        <div className="grid items-stretch gap-5 md:grid-cols-2">
          {/* free */}
          <article className="flex flex-col gap-5 rounded-[28px] border border-line bg-surface p-7">
            <div className="flex flex-col gap-1">
              <span className="text-[17px] font-bold text-ink-body">ฟรี</span>
              <span className="font-heading text-[44px] font-bold leading-none">฿0</span>
              <span className="text-[15px] text-ink-muted">ฟีเจอร์หลักครบ ใช้ได้เลย</span>
            </div>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[15.5px]">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/funds"
              className="mt-auto inline-flex min-h-[50px] items-center justify-center rounded-full border-2 border-brand px-6 font-bold text-brand no-underline hover:bg-brand-soft"
            >
              เริ่มใช้ฟรี
            </Link>
          </article>

          {/* premium */}
          <article className="force-light relative flex flex-col gap-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-brand to-brand-dark p-7 text-white shadow-[0_18px_40px_rgba(26,118,55,.28)]">
            <span aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-white/10" />
            <Lensy pose="heart" size={104} className="absolute right-3 top-3 max-sm:!h-[80px] max-sm:!w-[80px]" />
            <div className="relative flex flex-col gap-1">
              <span className="flex items-center gap-2 text-[17px] font-bold">
                Premium <span className="rounded-full bg-sun px-2.5 py-0.5 text-[12px] text-[#4A3500]">เร็ว ๆ นี้</span>
              </span>
              <span className="font-heading text-[44px] font-bold leading-none">
                ฿99<span className="text-[16px] font-medium text-white/80"> / เดือน</span>
              </span>
              <span className="text-[15px] text-white/85">สำหรับคนที่ถือหลายกอง</span>
            </div>
            <ul className="relative m-0 flex list-none flex-col gap-3 p-0">
              <li className="flex items-start gap-2.5 text-[15.5px] font-semibold">
                <Check light />
                ทุกอย่างในแผนฟรี
              </li>
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[15.5px]">
                  <Check light />
                  {f}
                </li>
              ))}
            </ul>
            <span
              aria-disabled="true"
              className="relative mt-auto inline-flex min-h-[50px] items-center justify-center rounded-full bg-white/15 px-6 font-bold text-white"
            >
              เปิดให้ใช้เร็ว ๆ นี้
            </span>
          </article>
        </div>

        <p className="m-0 text-center text-[14px] text-ink-muted">ช่วงเดโมยังไม่เปิดรับชำระเงิน · ทุกแผนไม่แนะนำให้ซื้อหรือขายกองใด</p>
      </div>
    </section>
  );
}

/* ── FAQ: accordion ── */

const FAQ: [string, string][] = [
  ["ค่าธรรมเนียมแฝงคืออะไร", "ค่าใช้จ่ายที่ไม่ได้จ่ายตอนกดซื้อ แต่ถูกหักจากเงินในกองทุนทุกปีค่ะ เช่น กองที่ไปลงทุนต่อในกองต่างประเทศ จะมีค่าใช้จ่ายของกองทุนหลักอีกชั้น ซึ่ง Factsheet ของกองไทยไม่ได้แสดง ต้องไปหาจากเอกสารของกองหลักต่างประเทศ น้องรวมทุกชั้นให้ พร้อมบอกที่มา"],
  ["ข้อมูลมาจากไหน เชื่อได้แค่ไหน", "ตัวเลขของกองมาจาก Factsheet หนังสือชี้ชวน เอกสารของกองหลัก หรือข้อมูลที่ ก.ล.ต. เผยแพร่ค่ะ ทุกตัวเลขบอกที่มา กองที่ตรวจเลขหน้าครบแล้วมีป้าย “ตรวจกับเอกสารแล้ว” ถ้าเอกสารไม่มี น้องจะบอกว่าไม่พบ ไม่เดา ส่วนศัพท์การเงินทั่วไป น้องอธิบายได้โดยติดป้ายว่าเป็นความรู้ทั่วไป"],
  ["บอกได้ไหมว่ากองไหนดีที่สุด", "น้องไม่แนะนำให้ซื้อหรือขาย และไม่จัดอันดับกองทุนค่ะ แต่ช่วยวางค่าใช้จ่ายและความเสี่ยงของแต่ละกองเทียบกันให้ดูได้"],
  ["ถามเรื่องการเงินทั่วไปได้ไหม", "ได้ค่ะ ถามความหมายของศัพท์หรือแนวคิดได้ เช่น TER คืออะไร กองทุนรวมฟีดเดอร์ต่างจากกองทั่วไปยังไง หรือดอกเบี้ยทบต้นทำงานยังไง น้องอธิบายด้วยภาษาง่ายและติดป้าย \"ความรู้ทั่วไป\" ให้เห็นว่าไม่ได้มาจากเอกสารของกองใด คำตอบแบบนี้ไม่มีตัวเลข และน้องไม่พูดเรื่องราคา ข่าว หรือคาดการณ์ตลาด ส่วนตัวเลขของกองยังบอกที่มาเสมอ"],
  ["ตัวเลขเป็นบาทคำนวณยังไง", "คำนวณด้วยสูตรในระบบ ไม่ได้ให้ AI คิดค่ะ ใช้ค่าธรรมเนียมจากเอกสาร กับผลตอบแทนสมมติที่ปรับเองได้ (ค่าเริ่มต้น 6% ต่อปี) ซึ่งเป็นสมมติฐาน ไม่ใช่การคาดการณ์"],
  ["เก็บข้อมูลส่วนตัวอะไรบ้าง", "เก็บเท่าที่จำเป็นค่ะ ไม่ต้องโหลดแอปหรือสมัครสมาชิก ใช้บัญชี LINE ที่มีอยู่ ไม่ขอชื่อ เบอร์โทร หรือข้อมูลบัญชี และรหัสผู้ใช้ LINE ถูกแปลงเป็นรหัสที่ย้อนกลับไม่ได้ (hash) ก่อนบันทึก"],
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
            ลังเลระหว่าง 2 กอง
            <br />
            ให้น้อง Lensy เทียบให้ดูก่อน
          </h2>
          <p className="m-0 opacity-90">เพิ่มเพื่อนใน LINE แล้วพิมพ์ชื่อกองที่สนใจได้เลยค่ะ</p>
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

/** The disclaimer and sample labels live on each page itself (hero, page headers, badges), not here. */
export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-[15px] md:px-6">
        <div className="flex flex-col gap-1.5">
          <FinLensLogo height={38} />
          <div className="text-ink-muted">FinLens AI — ผู้ช่วยการเงินที่ทำให้เห็นค่าใช้จ่ายที่มองไม่เห็น</div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-ink-muted">
          <Link href="/roadmap" className="font-semibold text-brand no-underline hover:underline">
            แผนในอนาคต
          </Link>
          <Link href="/privacy" className="font-semibold text-brand no-underline hover:underline">
            ความเป็นส่วนตัว
          </Link>
          <span>Trinity Hackathon 2026</span>
        </div>
      </div>
    </footer>
  );
}

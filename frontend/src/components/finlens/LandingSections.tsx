import Link from "next/link";
import { LineAddFriendButton } from "@/components/brand/LineAddFriendButton";
import { DISCLAIMER } from "@/lib/disclaimer";
import { homeFunds } from "@/lib/homeFunds";
import { SOURCE_LABEL, sourceRef } from "@/lib/sources";

import { AnswerCard } from "./chat";
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
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-brand-soft px-3.5 py-1.5 text-[14px] font-semibold text-brand">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-linegreen opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-linegreen" />
            </span>
            ผู้ช่วยการเงินสำหรับนักลงทุนมือใหม่ · LINE และเว็บ
          </span>
          <h1 id="hero-title" className="m-0 text-[32px] font-bold leading-[1.3] tracking-tight sm:text-[42px] lg:text-[50px]">
            ผู้ช่วยการเงินที่ทำให้เห็น
            <br />
            <span className="marker-green whitespace-nowrap">ค่าใช้จ่ายที่มองไม่เห็น</span>
          </h1>
          <p className="m-0 max-w-[540px] text-lg leading-relaxed text-ink-body">
            น้อง Lensy ตอบคำถามการเงินด้วยภาษาง่าย และเทียบกองทุนให้เห็นเคียงกันว่าแต่ละกองมีค่าใช้จ่ายอะไรบ้าง รวมถึงค่าใช้จ่ายที่มองไม่เห็น
            ทุกตัวเลขมาจากเอกสารทางการและบอกที่มาให้ตรวจสอบได้
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <LineAddFriendButton label="เพิ่มเพื่อนน้อง Lensy" />
          </div>
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

/* ── Pricing: two receipts ── */

type Plan = { name: string; tagline: string; features: string[]; price: string; per?: string; badge?: string; premium?: boolean };

const PLANS: Plan[] = [
  {
    name: "Free",
    tagline: "ฟีเจอร์หลักครบ ใช้ได้ทั้ง LINE และเว็บ",
    features: ["เทียบค่าใช้จ่ายทุกชั้นของ 2–3 กอง", "คำนวณส่วนต่างเป็นเงินบาท", "อธิบายทีละกอง พร้อมความเสี่ยง", "ถามน้อง Lensy เรื่องการเงิน"],
    price: "฿0",
  },
  {
    name: "Premium",
    tagline: "ทุกอย่างใน Free + ส่องทั้งพอร์ต",
    features: ["รวมค่าใช้จ่ายทุกกองที่ถืออยู่", "รวมความเสี่ยงของทั้งพอร์ต", "เช็กโฆษณากองทุนกับเอกสารจริง"],
    price: "฿99",
    per: "/ เดือน",
    badge: "เร็ว ๆ นี้",
    premium: true,
  },
];

function Receipt({ plan }: { plan: Plan }) {
  return (
    <article className="flex flex-col drop-shadow-[0_14px_24px_rgba(20,46,34,.10)]">
      <div className="flex flex-1 flex-col rounded-t-[20px] bg-surface px-7 pb-5 pt-7">
        <div className="flex items-center justify-between gap-3">
          <h3 className={`m-0 text-[28px] font-bold ${plan.premium ? "text-brand" : "text-ink"}`}>{plan.name}</h3>
          {plan.badge && <span className="rounded-full bg-sun px-3 py-1 text-[13px] font-bold text-[#4A3500]">{plan.badge}</span>}
        </div>
        <p className="m-0 mt-2 text-[15px] text-ink-muted">{plan.tagline}</p>
        <hr className="my-5 border-0 border-t-2 border-dashed border-line" />
        <ul className="m-0 mb-6 flex flex-1 list-none flex-col gap-3 p-0">
          {plan.features.map((f) => (
            <li key={f} className="text-[15.5px] text-ink-body">
              {f}
            </li>
          ))}
        </ul>
        <hr className="mb-4 mt-0 border-0 border-t-2 border-dashed border-line" />
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[15px] font-bold text-ink-muted">รวม</span>
          <span className="font-heading text-[40px] font-bold leading-none text-ink">
            {plan.price}
            {plan.per && <span className="ml-1.5 text-[15px] font-medium text-ink-muted">{plan.per}</span>}
          </span>
        </div>
      </div>
      <div aria-hidden="true" className="receipt-edge" />
    </article>
  );
}

export function PricingTable() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 bg-brand-tint px-5 py-16 md:px-6">
      <div className="mx-auto flex max-w-[920px] flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Lensy pose="heart" size={110} className="max-sm:!h-[88px] max-sm:!w-[88px]" />
          <div className="flex flex-col gap-2">
            <h2 id="pricing-title" className="relative m-0 text-[30px] font-bold leading-tight md:text-[38px]">
              <TitleDecor />
              เริ่ม<span className="text-brand">ฟรี</span> จ่ายเมื่ออยากส่องทั้งพอร์ต
            </h2>
            <p className="m-0 text-ink-muted">เทียบกองทุนได้ครบโดยไม่ต้องจ่าย Premium สำหรับคนที่ถือหลายกอง</p>
          </div>
        </div>

        <div className="grid w-full items-stretch gap-6 md:grid-cols-2">
          {PLANS.map((p) => (
            <Receipt key={p.name} plan={p} />
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <LineAddFriendButton label="เพิ่มเพื่อนน้อง Lensy" />
          <p className="m-0 text-center text-[13px] text-ink-muted">ช่วงเดโมยังไม่เปิดรับชำระเงิน</p>
        </div>
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
    <section aria-label="เริ่มใช้งาน" className="px-5 pb-16 pt-10 md:px-6 md:pt-24">
      <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[32px] md:overflow-visible border border-brand/15 bg-gradient-to-br from-brand-soft via-brand-tint to-surface px-7 py-10 md:px-14 md:py-12">
        <div className="relative flex max-w-[560px] flex-col gap-3">
          <h2 className="m-0 text-[28px] font-bold leading-snug md:text-[38px]">
            ลังเลระหว่าง 2 กอง?
            <br />
            ให้น้อง Lensy <span className="marker-green whitespace-nowrap">เทียบให้ดูก่อน</span>
          </h2>
          <p className="m-0 text-[17px] text-ink-body">เพิ่มเพื่อนใน LINE แล้วพิมพ์ชื่อกองที่สนใจได้เลยค่ะ</p>
          <LineAddFriendButton label="เพิ่มเพื่อนน้อง Lensy" className="mt-3 self-start" />
        </div>
        <span className="absolute bottom-0 right-6 hidden md:right-14 md:block">
          <span aria-hidden="true" className="absolute bottom-6 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-brand/10" />
          <span className="relative block">
            <Lensy pose="shield" size={280} />
            <MascotDecor />
          </span>
        </span>
      </div>
    </section>
  );
}

/** Every page using this footer carries the "not investment advice" line. */
export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-[15px] md:px-6">
        <div className="flex flex-col gap-1.5">
          <FinLensLogo height={38} />
          <div className="text-ink-muted">FinLens AI — ผู้ช่วยการเงินที่ทำให้เห็นค่าใช้จ่ายที่มองไม่เห็น</div>
          <div className="text-[13.5px] text-ink-muted">{DISCLAIMER}</div>
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

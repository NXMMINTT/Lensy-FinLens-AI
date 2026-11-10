import { Briefcase, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LineAddFriendButton } from "@/components/brand/LineAddFriendButton";
import { GLOSSARY } from "@/lib/glossary";
import { LearnCard } from "./learn/LearnCard";
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
        {/* phones: centred, one phrase per line, so the eye reads it top to bottom; sm and up: as before */}
        <div className="relative flex min-w-0 flex-col items-center gap-5 text-center sm:items-stretch sm:text-left">
          <HeroTextDecor />
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-1.5 text-[14px] font-semibold text-brand sm:self-start">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-linegreen opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-linegreen" />
            </span>
            สำหรับคนที่อยากเข้าใจเงินของตัวเองมากขึ้น
          </span>
          <h1 id="hero-title" className="m-0 text-[31px] font-bold leading-[1.3] tracking-tight sm:text-[38px] lg:text-[44px]">
            {/* Thai has no spaces between words: each phrase stays whole, lines break only between phrases */}
            <span className="block whitespace-nowrap sm:inline">ลงทุนอยู่ทุกวัน</span> <span className="block whitespace-nowrap sm:inline">แต่รู้หรือเปล่า…</span>
            <br className="hidden sm:block" />
            <span className="block text-brand-dark sm:inline dark:text-brand">
              <span className="block whitespace-nowrap sm:inline">เงินของคุณ</span>{" "}
              <span className="block whitespace-nowrap sm:inline">กำลังเสียค่าอะไรไปบ้าง?</span>
            </span>
          </h1>
          <p className="m-0 max-w-[540px] text-[17px] leading-[1.7] text-ink-body sm:text-lg">
            {["เปรียบเทียบกองทุน", "วิเคราะห์ค่าธรรมเนียม", "เป็นเงินบาท", "เข้าใจความเสี่ยง", "และตรวจสอบข้อมูล", "จากเอกสารต้นทาง", "ได้ง่ายขึ้น"].map((t, i) => (
              <span key={t} className="whitespace-nowrap">
                {t}
                {i < 6 && <wbr />}
              </span>
            ))}
          </p>
          <p className="m-0 w-full max-w-[540px] rounded-2xl bg-brand-tint px-4 py-3 text-[17px] font-bold leading-relaxed text-ink sm:bg-transparent sm:p-0 sm:text-lg">
            <span className="whitespace-nowrap">อยากลงทุนเอง</span> <span className="whitespace-nowrap">หรือให้มืออาชีพช่วยดูแล</span>{" "}
            <span className="whitespace-nowrap">ก็เลือกได้ในแบบของคุณ</span>
          </p>
          <div className="mt-1 flex w-full flex-wrap items-center gap-3">
            <LineAddFriendButton label="เริ่มต้นทำความเข้าใจการลงทุนฟรี" className="w-full justify-center text-[17px] sm:w-auto" />
          </div>
          <p className="m-0 text-[13px] text-ink-muted sm:text-[14px]">
            <span className="whitespace-nowrap">ไม่มีค่าสมัคร</span> · <span className="whitespace-nowrap">เครื่องมือหลักใช้ฟรี</span> ·{" "}
            <span className="whitespace-nowrap">เลือกเส้นทางได้เอง</span>
          </p>
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
      title: "พิมพ์ชื่อสิ่งที่จะลงทุนที่ลังเล",
      text: "ใส่ 2 กองในข้อความเดียวได้ ทั้งใน LINE และบนเว็บ",
      body: (
        <span className="rounded-2xl rounded-br-sm bg-chat px-3 py-1.5 text-[#0F2A12]">
          {A.code} กับ {B.code}
        </span>
      ),
    },
    {
      no: 2,
      title: "น้อง Lensy อ่านเอกสารทั้งสอง",
      text: "ดึงค่าจาก Factsheet ของไทย และเอกสารของกองหลักต่างประเทศ ทุกตัวเลขบอกที่มา",
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

/* ── Pricing: the free plan as one wide receipt ── */

const FREE_FEATURES: [string, string][] = [
  ["เทียบค่าใช้จ่ายทุกชั้นของหลายกอง", "รวมชั้นของกองทุนหลักที่ Factsheet ไม่ได้แสดง"],
  ["คำนวณส่วนต่างเป็นเงินบาท", "ปรับเงินลงทุนและจำนวนปีได้เอง"],
  ["อธิบายทีละกอง พร้อมความเสี่ยง", "ทุกตัวเลขบอกที่มาและเลขหน้า"],
  ["ถามน้อง Lensy เรื่องการเงิน", "ภาษาง่าย ทั้งใน LINE และบนเว็บ"],
];

function Check() {
  return (
    <span aria-hidden="true" className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5 10 17.5 19 7" />
      </svg>
    </span>
  );
}

function FreeReceipt() {
  return (
    <article className="w-full max-w-[820px] drop-shadow-[0_18px_30px_rgba(20,46,34,.12)]">
      <div className="relative grid overflow-hidden rounded-t-[24px] bg-surface md:grid-cols-[0.9fr_1.1fr]">
        {/* left: plan and price */}
        <div className="relative flex flex-col gap-4 bg-brand-soft/60 px-7 pb-7 pt-8 md:px-9">
          <span className="absolute right-5 top-5 rotate-[8deg] rounded-lg border-2 border-dashed border-brand px-2.5 py-0.5 text-[13px] font-bold tracking-wide text-brand">
            ใช้ฟรี
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="m-0 text-[26px] font-bold text-ink">Free</h3>
            <p className="m-0 text-[15px] text-ink-muted">ฟีเจอร์หลักครบ ใช้ได้ทั้ง LINE และเว็บ</p>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-heading text-[72px] font-bold leading-none text-brand">฿0</span>
            <span className="pb-2 text-[15px] font-medium text-ink-muted">ไม่มีค่าสมัคร</span>
          </div>
          <div className="mt-auto flex flex-col items-start gap-2 pt-2">
            <LineAddFriendButton label="เพิ่มเพื่อนน้อง Lensy" />
            <p className="m-0 text-[13px] text-ink-muted">ช่วงเดโมยังไม่เปิดรับชำระเงิน</p>
          </div>
        </div>

        {/* right: what is included */}
        <div className="flex flex-col gap-1 border-t-2 border-dashed border-line px-7 py-7 md:border-l-2 md:border-t-0 md:px-9 md:py-8">
          <span className="mb-3 text-[13px] font-bold tracking-wide text-ink-muted">สิ่งที่ได้</span>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {FREE_FEATURES.map(([title, sub]) => (
              <li key={title} className="flex gap-3">
                <Check />
                <span className="flex flex-col">
                  <span className="text-[16px] font-semibold text-ink">{title}</span>
                  <span className="text-[14px] text-ink-muted">{sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div aria-hidden="true" className="receipt-edge" />
    </article>
  );
}

/* ── Option 02: a licensed partner manages the portfolio (FinLens only connects) ── */

const PRO_POINTS = [
  "รับข้อมูลเกี่ยวกับบริการบริหารพอร์ต",
  "ทำความเข้าใจรูปแบบและเงื่อนไขบริการ",
  "เชื่อมต่อผู้เชี่ยวชาญเพื่อประเมินความเหมาะสม",
  "มีผู้ให้บริการที่ตรวจสอบข้อมูลได้",
];
const TRINITY_URL = "https://www.trinitythai.com";

function ProfessionalCard() {
  return (
    <article aria-labelledby="pro-title" className="w-full max-w-[820px] drop-shadow-[0_18px_30px_rgba(20,46,34,.12)]">
      <div className="relative grid overflow-hidden rounded-[24px] border border-sun/30 bg-surface md:grid-cols-[1.05fr_0.95fr]">
        {/* left: what it is, and the way to the partner */}
        <div className="relative flex flex-col gap-4 bg-gradient-to-br from-sun-soft via-sun-soft/50 to-surface px-7 pb-7 pt-8 md:px-9">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-sun/40 bg-surface/70 px-3 py-1 text-[12px] font-bold tracking-[0.12em] text-sun-ink">OPTION 02</span>
            <span aria-hidden="true" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8C766] text-[#2B2410] shadow-md">
              <Briefcase size={24} />
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold tracking-[0.16em] text-sun-ink">PROFESSIONAL MANAGEMENT</span>
            <h3 id="pro-title" className="m-0 text-[28px] font-bold leading-tight text-ink md:text-[32px]">
              ให้มืออาชีพช่วยบริหาร
            </h3>
          </div>
          <p className="m-0 text-[16px] leading-relaxed text-ink-body">
            สำหรับคนที่ไม่มีเวลาอ่านข้อมูล วิเคราะห์ตลาด หรือติดตามพอร์ตด้วยตัวเอง และต้องการให้ผู้เชี่ยวชาญช่วยดูแลการลงทุน
          </p>

          <div className="mt-auto flex flex-col gap-4 pt-2">
            <a
              href={TRINITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-[#E8C766] px-7 text-[17px] font-bold text-[#2B2410] no-underline shadow-[0_8px_20px_rgba(201,160,60,.35)] transition hover:-translate-y-0.5 hover:brightness-105 md:self-start"
            >
              ค้นหาผู้เชี่ยวชาญจาก Trinity
            </a>
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface/80 px-4 py-3">
              <Image src="/brand/trinity-logo.png" alt="โลโก้ Trinity" width={44} height={44} className="h-11 w-11 shrink-0 rounded-lg object-contain" />
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-[15px] font-bold tracking-wide text-ink">TRINITY SECURITIES</span>
                <span className="text-[13px] text-ink-muted">Anchor Partner · Professional Portfolio Management</span>
              </span>
            </div>
          </div>
        </div>

        {/* right: what the person gets */}
        <div className="flex flex-col gap-1 border-t-2 border-dashed border-line px-7 py-7 md:border-l-2 md:border-t-0 md:px-9 md:py-8">
          <span className="mb-3 text-[13px] font-bold tracking-wide text-ink-muted">สิ่งที่ได้</span>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {PRO_POINTS.map((t) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden="true" className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8C766] text-[#2B2410]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5 10 17.5 19 7" />
                  </svg>
                </span>
                <span className="text-[16px] font-semibold text-ink">{t}</span>
              </li>
            ))}
          </ul>
          <p className="m-0 mt-auto flex items-start gap-2 pt-6 text-[13px] leading-relaxed text-ink-muted">
            <Info aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
            FinLens AI เป็นแพลตฟอร์มข้อมูลและเชื่อมต่อผู้ให้บริการ การบริหารพอร์ตดำเนินการโดยผู้ให้บริการโดยตรง
          </p>
        </div>
      </div>
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
              ใช้ได้<span className="text-brand">ฟรี</span> ทุกฟีเจอร์
            </h2>
            <p className="m-0 text-ink-muted">เทียบกองทุน ดูทีละกอง คำนวณเป็นบาท และถามน้อง Lensy ไม่มีค่าใช้จ่าย</p>
          </div>
        </div>

        <FreeReceipt />

        <div className="-my-4 flex w-full max-w-[820px] items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-line" />
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-[15px] font-bold text-ink-muted shadow-sm">หรือ</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-line" />
        </div>

        <ProfessionalCard />
      </div>
    </section>
  );
}

/* ── Meanings: the investment-type terms from the glossary as open cards (the FAQ is the accordion) ── */

export function MeaningSection() {
  const group = GLOSSARY[0];
  return (
    <section id="glossary" aria-labelledby="glossary-title" className="scroll-mt-20 bg-brand-tint px-5 py-16 md:px-6">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:text-left">
          <Lensy pose="idea" size={96} />
          <div className="flex flex-col gap-1.5">
            <h2 id="glossary-title" className="m-0 text-[30px] font-bold leading-tight md:text-[38px]">
              ความหมาย<span className="text-brand">{group.title}</span>
            </h2>
            <p className="m-0 text-ink-muted">ศัพท์ที่เจอบ่อย อธิบายแบบเข้าใจง่าย ไม่ต้องกดเปิดค่ะ</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {group.terms.map((t, i) => {
            const [label, growth] = t.tip?.startsWith("การเติบโตโดยรวม:") ? ["การเติบโตโดยรวม", t.tip.slice("การเติบโตโดยรวม:".length).trim()] : ["ควรรู้", t.tip];
            return (
              <article key={t.id} className="flex flex-col gap-3 rounded-[20px] border border-line bg-surface p-5 shadow-[0_6px_20px_rgba(20,46,34,.05)]">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="font-heading text-[28px] font-bold leading-none text-brand/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="m-0 flex flex-col text-[19px] font-bold leading-snug">
                    {t.term}
                    {t.en && <span className="text-[13px] font-medium text-ink-muted">{t.en}</span>}
                  </h3>
                </div>
                <p className="m-0 text-[15px] text-ink-body">{t.text}</p>
                {growth && (
                  <p className="m-0 mt-auto rounded-xl bg-brand-soft/60 px-3 py-2 text-[14px] text-ink-body">
                    <b className="text-brand">{label}:</b> {growth}
                  </p>
                )}
              </article>
            );
          })}
          <LearnCard />
        </div>
      </div>
    </section>
  );
}

/* ── FAQ: accordion ── */

const FAQ: [string, string][] = [
  ["ค่าธรรมเนียมแฝงคืออะไร", "ค่าใช้จ่ายที่ไม่ได้จ่ายตอนกดซื้อ แต่ถูกหักจากเงินในกองทุนทุกปีค่ะ เช่น กองที่ไปลงทุนต่อในกองต่างประเทศ จะมีค่าใช้จ่ายของกองทุนหลักอีกชั้น ซึ่ง Factsheet ของกองไทยไม่ได้แสดง ต้องไปหาจากเอกสารของกองหลักต่างประเทศ น้องรวมทุกชั้นให้ พร้อมบอกที่มา"],
  ["ข้อมูลมาจากไหน เชื่อได้แค่ไหน", "ตัวเลขของกองมาจาก Factsheet หนังสือชี้ชวน เอกสารของกองหลัก หรือข้อมูลที่ ก.ล.ต. เผยแพร่ค่ะ ทุกกองบอกที่มาของข้อมูลไว้ท้ายหน้า ถ้าเอกสารไม่มี น้องจะบอกว่าไม่พบ ไม่เดา ส่วนศัพท์การเงินทั่วไป น้องอธิบายได้โดยติดป้ายว่าเป็นความรู้ทั่วไป"],
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
      {/* logo and what FinLens is, then one quiet line: links on the left, the event on the right */}
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 pb-5 pt-8 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-col gap-2">
          <FinLensLogo height={36} />
          <p className="m-0 text-[15px] text-ink-muted">
            <span className="whitespace-nowrap">ผู้ช่วยการเงิน</span>
            <wbr />
            <span className="whitespace-nowrap">ที่ทำให้เห็นค่าใช้จ่ายที่มองไม่เห็น</span>
          </p>
        </div>
        <Link
          href="/privacy"
          className="inline-flex min-h-[40px] items-center self-start rounded-full border border-line px-4 text-[14px] font-semibold text-ink-body no-underline transition hover:border-brand hover:text-brand md:self-auto"
        >
          ความเป็นส่วนตัว
        </Link>
      </div>
      <div className="border-t border-line-subtle">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4 text-[13px] text-ink-faint md:px-6">
          <span>© 2026 FinLens AI</span>
          <span>ผลงานส่ง Trinity Hackathon 2026</span>
        </div>
      </div>
    </footer>
  );
}

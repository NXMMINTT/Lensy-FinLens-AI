import { LineAddFriendButton } from "@/components/brand/LineAddFriendButton";
import { Twinkle } from "@/components/decor/Twinkle";
import { Phone } from "@/components/home/phone/Phone";
import { PlanReceipt } from "@/components/home/PlanReceipt";
import { SAMPLE_DATA_LABEL } from "@/lib/disclaimer";

import { Disclaimer } from "./Disclaimer";
import { Lensy, LensyFace } from "./Lensy";
import { SampleBadge } from "./SampleBadge";
import { CostScreen } from "./screens/CostScreen";
import { ExplainScreen } from "./screens/ExplainScreen";
import { FeeScreen } from "./screens/FeeScreen";
import { HeroScreen } from "./screens/HeroScreen";
import { RiskScreen } from "./screens/RiskScreen";

/* ── Hero ── */

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-12 gap-y-10 px-5 py-10 md:px-6 lg:min-h-[min(calc(100svh-66px),820px)] lg:flex-nowrap">
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-5">
          <span className="self-start rounded-full bg-brand-soft px-3.5 py-1 text-[15px] font-semibold text-brand">
            น้อง Lensy ผู้ช่วยอ่านเอกสารกองทุนใน LINE
          </span>
          <h1 id="hero-title" className="m-0 text-[32px] font-bold leading-[1.3] tracking-tight sm:text-[40px] md:text-[48px]">
            ก่อนซื้อกองทุน
            <br />
            รู้ให้ชัดว่า<span className="whitespace-nowrap text-brand">จ่ายอะไรไปบ้าง</span>
          </h1>
          <p className="m-0 max-w-[540px] text-lg text-ink-body">
            น้อง Lensy อ่าน Fund Factsheet และหนังสือชี้ชวนให้ แล้วบอกเป็นภาษาง่าย ๆ ว่ามีค่าใช้จ่ายอะไร เสียเงินไปกี่บาท และมีความเสี่ยงอะไร
            ทุกคำตอบบอกเลขหน้าที่มาให้ตรวจเองได้
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0 text-[15px]">
            {["ทุกตัวเลขมีเลขหน้า", "ตัวเลขเงินคิดด้วยสูตร ไม่ใช่ AI เดา", "ไม่เชียร์ ไม่จัดอันดับกอง"].map((t) => (
              <li key={t} className="rounded-full border border-line bg-brand-tint px-3 py-1 text-ink-body">
                <span className="mr-1 font-bold text-brand">✓</span>
                {t}
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-start gap-3">
            <LineAddFriendButton label="เพิ่มเพื่อนน้อง Lensy ฟรี" />
            <Disclaimer />
          </div>
        </div>

        <div className="relative flex min-w-0 flex-[1_1_440px] justify-center">
          <div className="relative">
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-soft to-surface max-md:hidden" />
            <div className="relative">
              <Phone tall>
                <HeroScreen />
              </Phone>
            </div>
            <Lensy size={150} className="absolute -bottom-6 -right-[120px] animate-bob max-md:-bottom-16 max-md:-right-6 max-md:!h-[100px] max-md:!w-[100px]" />
            <Twinkle className="-right-12 top-8 h-7 w-7 max-lg:hidden" />
            <Twinkle className="-left-10 top-1/3 h-4 w-4 max-lg:hidden" color="#1A7637" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Says out loud that every figure on the page is made up. */
export function SampleNotice() {
  return (
    <div className="border-y border-sun/40 bg-sun-soft px-5 py-3 text-center text-[15px] text-sun-ink">
      <b>{SAMPLE_DATA_LABEL}:</b> กองทุนและตัวเลขในหน้านี้สร้างขึ้นเพื่อสาธิตการทำงาน ไม่ใช่กองทุนจริง
    </div>
  );
}

/* ── Features ── */

type Feature = {
  id: string;
  no: number;
  name: string;
  title: React.ReactNode;
  intro: string;
  points: string[];
  screen: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    id: "hidden-fee",
    no: 1,
    name: "Hidden Fee Detector",
    title: (
      <>
        เจอค่าธรรมเนียม<span className="text-brand">ที่ซ่อนอยู่</span>
      </>
    ),
    intro: "กองทุนที่ไปลงทุนต่อในกองต่างประเทศ (Feeder Fund) มีค่าใช้จ่ายสองชั้น ชั้นที่สองมักอยู่ในหนังสือชี้ชวน ไม่อยู่ใน Factsheet",
    points: ["รวมค่าใช้จ่ายทุกชั้นเป็นต้นทุนต่อปีรวม", "แยกสีให้เห็นว่าแต่ละชั้นเท่าไหร่", "บอกเลขหน้าของทุกค่า และเตือนเมื่อค่านั้นอยู่ในหนังสือชี้ชวน"],
    screen: <FeeScreen />,
  },
  {
    id: "risk-alert",
    no: 2,
    name: "Risk Alert",
    title: (
      <>
        ความเสี่ยงที่<span className="text-brand">มักถูกมองข้าม</span>
      </>
    ),
    intro: "ค่าเงิน ตลาดต่างประเทศ การลงทุนกระจุกตัว และเงื่อนไขการขายคืน สรุปให้ในการ์ดเดียว",
    points: [
      "ป้ายระดับ สูง / ปานกลาง / ควรรู้ ตามที่เอกสารระบุ",
      "สร้างจากกฎที่ตั้งไว้ชัดเจน ไม่ได้ให้ AI ตัดสิน",
      "ไม่บอกว่ากองไหนดีหรือไม่ดี ให้ข้อมูลไว้ตัดสินใจเอง",
    ],
    screen: <RiskScreen />,
  },
  {
    id: "true-cost",
    no: 3,
    name: "True Cost Calculator",
    title: (
      <>
        ค่าธรรมเนียม<span className="text-brand">เป็นบาท</span> ไม่ใช่แค่ %
      </>
    ),
    intro: "ตัวเลข 1% กับ 2% ดูต่างกันนิดเดียว แต่ถือหลายปีอาจต่างกันหลายหมื่นบาท เทียบให้เห็นได้ 2–3 กอง",
    points: [
      "ปรับเงินลงทุน จำนวนปี (1–30 ปี) และผลตอบแทนสมมติได้",
      "คำนวณด้วยสูตรในระบบ ไม่ได้ให้ AI คิดตัวเลข",
      "แสดงสมมติฐานทุกครั้ง ผลตอบแทนที่ใช้ไม่ใช่การคาดการณ์",
    ],
    screen: <CostScreen />,
  },
  {
    id: "ai-explain",
    no: 4,
    name: "AI Explain",
    title: (
      <>
        ถามได้เหมือน<span className="text-brand">คุยกับเพื่อน</span>
      </>
    ),
    intro: "ศัพท์การเงินยาก ๆ น้อง Lensy อธิบายให้สั้น ง่าย และบอกว่าข้อมูลมาจากหน้าไหนของเอกสาร",
    points: [
      "ตอบจากเอกสารของกองนั้นเท่านั้น ถ้าไม่มีจะบอกว่า “ไม่พบข้อมูลนี้ในเอกสาร”",
      "ศัพท์เทคนิคมีคำอธิบายในวงเล็บ",
      "ไม่แนะนำให้ซื้อหรือขาย และไม่คาดการณ์ผลตอบแทน",
    ],
    screen: <ExplainScreen />,
  },
];

function FeatureBlock({ f, flip }: { f: Feature; flip: boolean }) {
  return (
    <section id={f.id} aria-labelledby={`${f.id}-title`} className="scroll-mt-20 px-5 py-14 md:px-6">
      <div className={`mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-16 gap-y-10 ${flip ? "lg:flex-row-reverse" : ""}`}>
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
          <span className="self-start rounded-full bg-brand-soft px-3.5 py-1 text-[15px] font-semibold text-brand">
            ฟีเจอร์ {f.no} · {f.name}
          </span>
          <h2 id={`${f.id}-title`} className="m-0 text-[32px] font-bold leading-snug md:text-4xl">
            {f.title}
          </h2>
          <p className="m-0 text-ink-body">{f.intro}</p>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {f.points.map((p) => (
              <li key={p} className="flex gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">✓</span>
                {p}
              </li>
            ))}
          </ul>
          <SampleBadge className="mt-1 self-start !text-[13px]" />
        </div>
        <div className="flex min-w-0 flex-[0_1_300px] justify-center">
          <Phone>{f.screen}</Phone>
        </div>
      </div>
    </section>
  );
}

export function Features() {
  return (
    <div id="features" className="scroll-mt-20">
      <div className="px-5 pt-16 text-center">
        <h2 className="m-0 text-[32px] font-bold md:text-[40px]">
          4 เรื่องที่น้อง Lensy <span className="whitespace-nowrap text-brand">ช่วยดูให้</span>
        </h2>
        <p className="m-0 mt-2 text-ink-muted">ตัวอย่างแชตจริงใน LINE ใช้ข้อมูลตัวอย่าง</p>
      </div>
      {FEATURES.map((f, i) => (
        <FeatureBlock key={f.id} f={f} flip={i % 2 === 1} />
      ))}
    </div>
  );
}

/* ── Pricing ── */

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 px-5 py-16 md:px-6">
      <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-9">
        <div className="text-center">
          <h2 id="pricing-title" className="m-0 text-[32px] font-bold md:text-[40px]">
            เริ่มใช้<span className="text-brand">ฟรี</span>
          </h2>
          <p className="m-0 mt-2 text-ink-muted">ฟีเจอร์หลักทั้ง 4 อย่างใช้ได้ฟรี Premium สำหรับคนที่อยากดูทั้งพอร์ต</p>
        </div>
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-8">
          <PlanReceipt
            name="ฟรี"
            subtitle="อ่านเอกสารกองทุนทีละกอง"
            price="฿0"
            lines={["ตรวจค่าธรรมเนียมแฝง", "แจ้งเตือนความเสี่ยงที่อาจมองข้าม", "คำนวณต้นทุนเป็นบาท เทียบได้ 2–3 กอง", "ถามน้อง Lensy ผ่าน LINE และเว็บ"]}
          />
          <PlanReceipt
            highlight
            badge="เร็ว ๆ นี้"
            name="Premium"
            subtitle="ทุกอย่างในแบบฟรี และ"
            price="฿99"
            per="/ เดือน"
            lines={["ส่องพอร์ต: รวมค่าใช้จ่ายและความเสี่ยงของทุกกองที่ถืออยู่", "เช็กก่อนเชื่อ: ส่งข้อความหรือโฆษณากองทุนมาให้เทียบกับเอกสารจริง"]}
          />
        </div>
        <p className="m-0 text-center text-[15px] text-ink-muted">ช่วงเดโมยังไม่เปิดรับชำระเงิน</p>
      </div>
    </section>
  );
}

/* ── FAQ ── */

const FAQ: [string, string][] = [
  ["FinLens AI คืออะไรคะ", "เป็นผู้ช่วยอ่านเอกสารกองทุนรวมค่ะ น้อง Lensy สรุปค่าใช้จ่าย ความเสี่ยง และต้นทุนเป็นบาท จาก Fund Factsheet และหนังสือชี้ชวน พร้อมบอกเลขหน้าที่มา"],
  ["ข้อมูลมาจากไหน เชื่อได้แค่ไหน", "มาจากเอกสารทางการของกองทุนค่ะ ทุกค่ามีเลขหน้าให้เปิดตรวจเอง และทีมตรวจทีละค่าเทียบกับเอกสารก่อนนำมาแสดง ถ้าเอกสารไม่มีข้อมูล น้องจะบอกว่าไม่พบ ไม่เดา"],
  ["บอกได้ไหมว่ากองไหนดีที่สุด", "ขอโทษค่ะ น้องไม่แนะนำให้ซื้อหรือขาย และไม่จัดอันดับกองทุน แต่ช่วยวางค่าใช้จ่ายและความเสี่ยงของแต่ละกองเทียบกันให้ดูได้ค่ะ"],
  ["ตัวเลขเป็นบาทคำนวณยังไง", "คำนวณด้วยสูตรในระบบ ไม่ได้ให้ AI คิดค่ะ ใช้ค่าธรรมเนียมจากเอกสาร กับผลตอบแทนสมมติที่ปรับเองได้ (ค่าเริ่มต้น 6% ต่อปี) ซึ่งเป็นสมมติฐาน ไม่ใช่การคาดการณ์"],
  ["ต้องโหลดแอปเพิ่มไหม", "ไม่ต้องค่ะ เพิ่มเพื่อนน้อง Lensy ใน LINE แล้วพิมพ์ชื่อกองทุนได้เลย หน้าเว็บก็เปิดจาก LINE ได้"],
  ["เก็บข้อมูลส่วนตัวอะไรบ้าง", "เก็บเท่าที่จำเป็นค่ะ ไม่ขอชื่อ เบอร์โทร หรือข้อมูลบัญชี และรหัสผู้ใช้ LINE ถูกแปลงเป็นรหัสที่ย้อนกลับไม่ได้ (hash) ก่อนบันทึก"],
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 px-5 pb-16 pt-4 md:px-6">
      <div className="mx-auto flex max-w-[1100px] flex-wrap gap-x-14 gap-y-8">
        <div className="flex flex-[1_1_280px] flex-col items-start gap-3">
          <span className="rounded-full bg-brand-soft px-3.5 py-1 text-[15px] font-semibold text-brand">คำถามที่พบบ่อย</span>
          <h2 id="faq-title" className="m-0 text-[32px] font-bold leading-tight md:text-[40px]">
            เรื่องที่คนชอบ
            <br />
            ถามน้อง Lensy
          </h2>
          <Lensy size={160} className="mt-4 max-md:hidden" />
        </div>
        <dl className="force-light m-0 flex flex-[2_1_520px] flex-col gap-5 rounded-[28px] bg-[#DCEBFD] p-5 md:p-6">
          {FAQ.map(([q, a]) => (
            <div key={q} className="flex flex-col gap-2.5">
              <dt className="max-w-[85%] self-end rounded-[20px] rounded-br-md bg-chat px-[18px] py-2.5 font-semibold text-[#0F2A12]">{q}</dt>
              <dd className="m-0 flex max-w-[92%] items-end gap-2.5 self-start">
                <LensyFace size={36} />
                <span className="rounded-[20px] rounded-bl-md bg-surface px-[18px] py-2.5 text-ink-body">{a}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ── Closing CTA + footer ── */

export function StartCta() {
  return (
    <section aria-label="เริ่มใช้งาน" className="px-5 pb-16 md:px-6">
      <div className="relative mx-auto flex max-w-[1100px] flex-col items-center gap-4 overflow-hidden rounded-[32px] bg-surface px-6 py-12 text-center">
        <Twinkle className="left-[12%] top-12 h-8 w-8" />
        <Twinkle className="right-[14%] top-16 h-5 w-5" color="#1A7637" />
        <Lensy size={140} className="animate-bob" />
        <h2 className="m-0 text-[30px] font-bold leading-tight md:text-[38px]">
          อยากรู้ว่ากองที่สนใจ<span className="text-brand">มีค่าใช้จ่ายอะไร</span>
        </h2>
        <p className="m-0 text-ink-muted">เพิ่มเพื่อนน้อง Lensy แล้วพิมพ์ชื่อกองทุนได้เลยค่ะ</p>
        <LineAddFriendButton label="เพิ่มเพื่อนน้อง Lensy" />
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-8 text-[15px] md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LensyFace size={44} />
            <div>
              <div className="font-heading text-[22px] font-bold text-brand">FinLens AI</div>
              <div className="text-ink-muted">เข้าใจกองทุนก่อนตัดสินใจ ทุกคำตอบมีเลขหน้าที่มา</div>
            </div>
          </div>
          <div className="text-ink-muted">Trinity Hackathon 2026</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <Disclaimer className="font-semibold text-ink-body" />
          <span className="text-ink-muted">ข้อมูลกองทุนในหน้านี้เป็น{SAMPLE_DATA_LABEL}</span>
        </div>
      </div>
    </footer>
  );
}

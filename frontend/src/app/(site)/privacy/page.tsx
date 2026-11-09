import type { Metadata } from "next";

import { LandingHeader } from "@/components/finlens/LandingHeader";
import { LandingFooter } from "@/components/finlens/LandingSections";
import { Lensy } from "@/components/finlens/Lensy";

export const metadata: Metadata = {
  title: "ความเป็นส่วนตัว | FinLens AI",
  description: "FinLens AI เก็บอะไร ไม่เก็บอะไร และส่งอะไรไปประมวลผลที่ Google Gemini ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

/** Each line matches what the code does (lib/session.ts, middleware.ts, lib/askService.ts, lib/ai.ts). */
const KEEP = [
  {
    title: "รหัสผู้ใช้ LINE แบบแปลงแล้ว (hash)",
    text: "เมื่อเข้าสู่ระบบด้วย LINE ระบบแปลงรหัสผู้ใช้ LINE (userId) ด้วยวิธีที่ย้อนกลับไม่ได้ แล้วเก็บไว้ในคุกกี้ของเบราว์เซอร์คุณ พร้อมวันหมดอายุ 7 วัน ใช้แค่ยืนยันว่าเข้าสู่ระบบแล้ว ต้องเข้าสู่ระบบก่อนถามน้อง Lensy ในหน้าแชต ส่วนหน้ากอง เทียบ และคำนวณ เปิดดูได้โดยไม่ต้องเข้าสู่ระบบ",
  },
  {
    title: "การตั้งค่าในเบราว์เซอร์ของคุณ",
    text: "โหมดสว่างหรือมืดที่เลือกไว้ และสถานะระหว่างเข้าสู่ระบบ เก็บอยู่ในเบราว์เซอร์ของคุณเท่านั้น ส่วนชุดเครื่องมือของ LINE (LIFF) เก็บข้อมูลการเข้าสู่ระบบ LINE ไว้ในเบราว์เซอร์ตามปกติของ LINE",
  },
];

const NOT_KEEP = [
  "ไม่เก็บชื่อ รูปโปรไฟล์ เบอร์โทร หรืออีเมล",
  "ไม่มีฐานข้อมูลสมาชิก ไม่ต้องสมัครและไม่มีรหัสผ่าน",
  "ไม่บันทึกคำถามหรือประวัติแชตลงที่ใด ทั้งบนเว็บและใน LINE คำตอบที่ตรวจแล้วพักไว้ในหน่วยความจำของเซิร์ฟเวอร์ 1 ชั่วโมงเพื่อตอบคำถามเดียวกันซ้ำ โดยไม่ผูกกับตัวผู้ถาม และนับจำนวนคำถามต่อนาทีไว้ชั่วคราวเพื่อกันการถามรัว",
  "ไม่เก็บรหัสผู้ใช้ LINE แบบตัวจริง",
  "ไม่ขายหรือแบ่งปันข้อมูลให้ใครเพื่อการโฆษณา",
];

const AI = [
  "คำถามที่ต้องให้ AI อธิบาย จะส่งไปประมวลผลที่ Google Gemini (Gemini API ของ Google) พร้อมข้อมูลกองทุนที่ทีมตรวจแล้วและข้อความจากเอกสารของกองนั้น",
  "ไม่ส่งรหัสผู้ใช้ LINE ชื่อ คุกกี้ หรือข้อมูลส่วนตัวอื่นไปด้วย ส่งเฉพาะข้อความคำถาม",
  "คำถามที่ขอคำแนะนำหรือขอให้ทำนาย และคำถามตัวเลขเป็นบาท ตอบด้วยกฎและสูตรในระบบ จึงไม่ถูกส่งไปที่ Google",
  "Google ดูแลข้อความที่ได้รับตามเงื่อนไขการใช้บริการของ Google จึงไม่ควรพิมพ์ข้อมูลส่วนตัว เช่น เลขบัญชีหรือเลขบัตรประชาชน ลงในคำถาม",
];

const OTHERS = [
  { title: "LINE", text: "ข้อความที่คุยกับน้อง Lensy ใน LINE ผ่านระบบของ LINE ตามนโยบายของ LINE ระบบเราอ่านข้อความเพื่อตอบกลับ แล้วไม่เก็บไว้" },
  { title: "ผู้ให้บริการเว็บ (Vercel)", text: "เซิร์ฟเวอร์ของผู้ให้บริการอาจบันทึกข้อมูลการเข้าใช้ทั่วไป เช่น เวลาและที่อยู่ IP ตามปกติของบริการเว็บ" },
];

export default function PrivacyPage() {
  return (
    <div className="overflow-x-clip text-ink">
      <LandingHeader />
      <main className="bg-surface">
        <div className="mx-auto flex max-w-[860px] flex-col gap-10 px-5 py-12 md:px-6">
          <header className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex max-w-[600px] flex-col gap-3">
              <span className="self-start rounded-md bg-brand-soft px-2.5 py-1 text-[14px] font-bold text-brand">ความเป็นส่วนตัว</span>
              <h1 className="m-0 text-[30px] font-bold leading-tight md:text-[38px]">
                เก็บเท่าที่จำเป็น <span className="marker-green">และบอกตรง ๆ</span>
              </h1>
              <p className="m-0 text-ink-body">หน้านี้บอกว่า FinLens AI เก็บอะไร ไม่เก็บอะไร และส่งอะไรไปประมวลผลที่ไหนบ้างค่ะ</p>
            </div>
            <Lensy pose="shield" size={130} className="max-sm:hidden" />
          </header>

          <section aria-labelledby="keep-title" className="flex flex-col gap-3">
            <h2 id="keep-title" className="m-0 text-[22px] font-bold">สิ่งที่เก็บ</h2>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {KEEP.map((k) => (
                <li key={k.title} className="rounded-2xl border border-line bg-surface p-4">
                  <b className="text-[16px]">{k.title}</b>
                  <p className="m-0 mt-1 text-[15px] text-ink-body">{k.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="not-keep-title" className="flex flex-col gap-3">
            <h2 id="not-keep-title" className="m-0 text-[22px] font-bold">สิ่งที่ไม่เก็บ</h2>
            <ul className="m-0 flex flex-col gap-1.5 pl-5 text-[15px] text-ink-body">
              {NOT_KEEP.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="ai-title" className="flex flex-col gap-3">
            <h2 id="ai-title" className="m-0 text-[22px] font-bold">คำถามที่ส่งไปให้ AI</h2>
            <ul className="m-0 flex flex-col gap-1.5 pl-5 text-[15px] text-ink-body">
              {AI.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="others-title" className="flex flex-col gap-3">
            <h2 id="others-title" className="m-0 text-[22px] font-bold">บริการอื่นที่เกี่ยวข้อง</h2>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {OTHERS.map((o) => (
                <li key={o.title} className="rounded-2xl border border-line bg-surface p-4">
                  <b className="text-[16px]">{o.title}</b>
                  <p className="m-0 mt-1 text-[15px] text-ink-body">{o.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="delete-title" className="flex flex-col gap-2">
            <h2 id="delete-title" className="m-0 text-[22px] font-bold">ลบข้อมูลของคุณ</h2>
            <p className="m-0 text-[15px] text-ink-body">
              กด &ldquo;ออกจากระบบ&rdquo; เพื่อลบคุกกี้เข้าสู่ระบบและออกจาก LINE ในเบราว์เซอร์นั้น หรือล้างข้อมูลเว็บไซต์ในการตั้งค่าเบราว์เซอร์ เพราะระบบไม่มีข้อมูลของคุณเก็บไว้ที่อื่น
            </p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

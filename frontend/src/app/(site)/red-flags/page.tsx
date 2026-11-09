import type { Metadata } from "next";
import { Phone, ShieldCheck, TriangleAlert } from "lucide-react";

import { AppShell } from "@/components/finlens/app/AppShell";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { GENERAL_NOTE } from "@/lib/ask";

export const metadata: Metadata = {
  title: "สัญญาณเตือนกลโกงการลงทุน | FinLens AI",
  description: "สัญญาณที่ควรสงสัยก่อนโอนเงินลงทุน วิธีเช็กก่อนโอน และสิ่งที่ควรทำถ้าสงสัยว่าโดนหลอก ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

/**
 * Investment scam red flags: general knowledge, no figures of any product. The only names and
 * phone numbers here are the ones already in the team's checked learn content (SEC Check First,
 * Investor Alert, 1207 / 1213 / 1186), so nothing unchecked is added.
 */
const FLAGS: { title: string; why: string; example: string }[] = [
  {
    title: "รับประกันกำไรสูง หรือบอกว่าไม่มีทางขาดทุน",
    why: "การลงทุนจริงมีความเสี่ยงเสมอ ยิ่งผลตอบแทนที่สัญญาไว้สูงเท่าไหร่ ความเสี่ยงก็ยิ่งสูง ใครรับประกันกำไรสูงและสม่ำเสมอ ให้สงสัยไว้ก่อน",
    example: "“ลงทุนวันนี้ ได้ปันผลทุกเดือน การันตีไม่ขาดทุน”",
  },
  {
    title: "เร่งให้รีบตัดสินใจ",
    why: "ผู้ให้บริการที่ถูกต้องไม่จำเป็นต้องกดดันให้โอนภายในไม่กี่ชั่วโมง การเร่งเป็นวิธีไม่ให้เรามีเวลาตรวจสอบหรือถามคนอื่น",
    example: "“รับจำนวนจำกัด ปิดรับคืนนี้ ถ้าช้าจะหมดสิทธิ์”",
  },
  {
    title: "ได้เงินเพิ่มเมื่อชวนคนอื่นมาลงทุนต่อ",
    why: "ถ้ารายได้หลักมาจากการหาสมาชิกใหม่ อาจเป็นแชร์ลูกโซ่ คือเอาเงินของคนใหม่มาจ่ายคนเก่า พอหาคนใหม่ไม่ได้ ระบบจะล่มและคนส่วนใหญ่เสียเงิน",
    example: "“ชวนเพื่อนมา 3 คน ได้ค่าแนะนำเพิ่มทุกเดือน”",
  },
  {
    title: "ไม่มีใบอนุญาต หรือใบอนุญาตไม่ตรงกับสิ่งที่ขาย",
    why: "ผู้ให้บริการในตลาดทุนต้องได้รับอนุญาตจาก ก.ล.ต. และใบอนุญาตต้องครอบคลุมบริการที่เสนอจริง การอ้างว่าจดทะเบียนบริษัทแล้วไม่ได้แปลว่ามีใบอนุญาต",
    example: "“บริษัทเราจดทะเบียนถูกต้อง มีเลขทะเบียนนิติบุคคล”",
  },
  {
    title: "ให้โอนเข้าบัญชีส่วนตัว",
    why: "ผู้ให้บริการที่ได้รับอนุญาตรับเงินผ่านบัญชีของบริษัทหรือช่องทางทางการ ถ้าให้โอนเข้าบัญชีชื่อบุคคล หรือเปลี่ยนบัญชีบ่อย ให้หยุดก่อน",
    example: "“โอนเข้าบัญชีแอดมินก่อน แล้วระบบจะเติมยอดให้”",
  },
  {
    title: "อธิบายไม่ได้ว่าเงินไปลงทุนอะไร",
    why: "การลงทุนที่ถูกต้องมีเอกสาร เช่น หนังสือชี้ชวนหรือ Factsheet บอกว่าเงินไปลงในอะไร มีค่าใช้จ่ายอะไร ถ้ามีแต่คำว่าระบบลับ บอท หรือเทรดเดอร์มือทอง แต่ไม่มีเอกสาร ให้ระวัง",
    example: "“ใช้ AI เทรดอัตโนมัติ สูตรลับเปิดเผยไม่ได้”",
  },
  {
    title: "ใช้รูปคนดังหรือสลิปกำไรเป็นหลักฐาน",
    why: "รูปคนมีชื่อเสียง ภาพสลิป หรือรีวิวในกลุ่มแชต ทำปลอมได้ง่าย และไม่ใช่หลักฐานว่าการลงทุนนั้นถูกกฎหมายหรือได้กำไรจริง",
    example: "“ดูสลิปสมาชิกได้กำไรเมื่อวาน คนดังก็ลงทุนกับเรา”",
  },
  {
    title: "ติดต่อมาเองทางแชต แล้วให้ติดตั้งแอปหรือขอรหัส",
    why: "ถ้ามีคนทักมาชวนเข้ากลุ่ม ให้ติดตั้งแอปที่ไม่ได้มาจากร้านค้าแอปทางการ หรือขอรหัส OTP และรหัสผ่าน อย่าทำตาม ผู้ให้บริการจริงไม่ขอรหัสเหล่านี้",
    example: "“กดลิงก์นี้เพื่อติดตั้งแอปลงทุน แล้วส่งรหัส OTP มายืนยัน”",
  },
];

const STEPS: { title: string; text: string }[] = [
  { title: "ตรวจใบอนุญาต", text: "ค้นชื่อผู้ให้บริการและผลิตภัณฑ์ใน SEC Check First ของ ก.ล.ต. และดูว่ามีชื่ออยู่ในรายการเตือน Investor Alert หรือไม่" },
  { title: "ขอเอกสารของผลิตภัณฑ์", text: "อ่านหนังสือชี้ชวนหรือ Factsheet ว่าเงินไปลงในอะไร ความเสี่ยงคืออะไร มีค่าใช้จ่ายเท่าไหร่ ถ้าไม่มีเอกสารให้ ถือเป็นสัญญาณเตือน" },
  { title: "ดูบัญชีที่ให้โอน", text: "ชื่อบัญชีต้องเป็นชื่อบริษัทที่ได้รับอนุญาต ไม่ใช่ชื่อบุคคล และควรตรงกับช่องทางที่บริษัทประกาศไว้" },
  { title: "ใจเย็น แล้วถามคนที่ไว้ใจ", text: "การลงทุนที่ดีรอได้ ลองเล่าให้คนในครอบครัวหรือเพื่อนฟัง ถ้าอธิบายให้คนอื่นเข้าใจไม่ได้ อาจยังไม่ควรโอน" },
];

const IF_SCAMMED = [
  "หยุดโอนเงินเพิ่ม แม้จะถูกบอกว่าต้องจ่ายค่าธรรมเนียมเพื่อถอนเงิน",
  "เก็บหลักฐานทั้งหมด เช่น แชต สลิป ชื่อบัญชี ลิงก์ และหน้าจอแอป",
  "ติดต่อธนาคารของเราทันที เพื่อแจ้งเรื่องบัญชีที่โอนไป",
  "ร้องเรียนหน่วยงานที่ดูแล: ตลาดทุน ก.ล.ต. โทร. 1207 · ธนาคาร ธนาคารแห่งประเทศไทย โทร. 1213 · ประกันภัย คปภ. โทร. 1186 และแจ้งความกับตำรวจ",
];

export default function RedFlagsPage() {
  return (
    <AppShell sampleNote={false}>
      <PageHeader
        label="สัญญาณเตือนกลโกง"
        title="ก่อนโอนเงินลงทุน"
        mark="เช็กสัญญาณเตือนก่อน"
        text="กลโกงการลงทุนมักมีรูปแบบซ้ำ ๆ ถ้ารู้สัญญาณเตือนไว้ จะหยุดได้ทันก่อนเสียเงิน อ่านไล่ไปทีละข้อได้เลยค่ะ"
        pose="shield"
      />

      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-12">
        <section aria-labelledby="flags-title" className="flex flex-col">
          <h2 id="flags-title" className="m-0 flex items-center gap-2.5 border-b-2 border-brand/20 pb-3 text-[24px] font-bold md:text-[28px]">
            <TriangleAlert aria-hidden="true" size={26} className="text-sun-ink" />
            สัญญาณที่ควรสงสัย
          </h2>
          <ol className="m-0 list-none p-0">
            {FLAGS.map((f, i) => (
              <li key={f.title} className="flex gap-4 border-b border-line-subtle py-6 last:border-0 md:gap-5">
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sun-soft text-[15px] font-bold text-sun-ink">
                  {i + 1}
                </span>
                <div className="flex min-w-0 flex-col gap-2 pt-1">
                  <h3 className="m-0 text-[19px] font-bold leading-snug text-ink">{f.title}</h3>
                  <p className="m-0 text-[16px] leading-[1.75] text-ink-body">{f.why}</p>
                  <p className="m-0 text-[15px] leading-relaxed text-ink-muted">
                    <span className="font-semibold text-ink-body">ตัวอย่างคำชวน</span> · {f.example}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="steps-title" className="flex flex-col gap-4">
          <h2 id="steps-title" className="m-0 flex items-center gap-2.5 border-b-2 border-brand/20 pb-3 text-[24px] font-bold md:text-[28px]">
            <ShieldCheck aria-hidden="true" size={26} className="text-brand" />
            เช็กก่อนโอน
          </h2>
          <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-1.5 rounded-2xl bg-brand-tint p-4">
                <span className="text-[13px] font-bold text-brand">ขั้นที่ {i + 1}</span>
                <b className="text-[17px] text-ink">{s.title}</b>
                <span className="text-[15px] leading-relaxed text-ink-body">{s.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="help-title" className="flex flex-col gap-4">
          <h2 id="help-title" className="m-0 flex items-center gap-2.5 border-b-2 border-brand/20 pb-3 text-[24px] font-bold md:text-[28px]">
            <Phone aria-hidden="true" size={24} className="text-brand" />
            ถ้าสงสัยว่าโดนหลอก
          </h2>
          <ol className="m-0 flex flex-col gap-2.5 pl-6 text-[16px] leading-[1.75] text-ink-body marker:font-bold marker:text-brand">
            {IF_SCAMMED.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </section>

        <div className="flex flex-col gap-3 border-t border-line pt-6">
          <p className="m-0 text-[14px] text-ink-muted">
            {GENERAL_NOTE} ตัวอย่างคำชวนเป็นตัวอย่างสมมติ ไม่ได้หมายถึงบริษัทใด เบอร์โทรอาจเปลี่ยน ควรตรวจกับเว็บไซต์ของหน่วยงานอีกครั้ง
          </p>
        </div>
      </div>
    </AppShell>
  );
}

import type { Metadata } from "next";
import { Check, FileText } from "lucide-react";

import { AppShell } from "@/components/finlens/app/AppShell";
import { PageHeader } from "@/components/finlens/app/PageHeader";

export const metadata: Metadata = {
  title: "เช็กลิสต์ก่อนซื้อกอง | FinLens AI",
  description: "สิ่งที่ควรเปิดดูในเอกสารกองทุนก่อนตัดสินใจ ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

type Item = { q: string; why: string; where: string };

/** What to look at in the documents. Where-to-look is the usual Fund Fact Sheet layout; it can differ per fund. */
const ITEMS: Item[] = [
  {
    q: "ต้นทุนต่อปีรวมทุกชั้นกี่เปอร์เซ็นต์",
    why: "ค่าใช้จ่ายรายปีถูกหักทุกปีและทบไปเรื่อย ๆ ส่วนต่างเล็ก ๆ กลายเป็นเงินก้อนเมื่อถือนาน",
    where: "Factsheet ส่วนค่าธรรมเนียมที่เรียกเก็บจากกองทุน (ค่าใช้จ่ายรวม หรือ TER)",
  },
  {
    q: "เป็นกองฟีดเดอร์ไหม มีค่าใช้จ่ายของกองทุนหลักอีกชั้นหรือเปล่า",
    why: "Factsheet ของกองไทยไม่ได้แสดงค่าใช้จ่ายกองหลัก ต้องไปหาจากเอกสารของกองหลักต่างประเทศ ถ้าดูแค่ TER ของกองไทย อาจเห็นต้นทุนต่ำกว่าจริง",
    where: "Factsheet ส่วนนโยบายการลงทุน (ชื่อกองทุนหลัก) และหนังสือชี้ชวน ส่วนข้อมูลกองทุนหลัก",
  },
  {
    q: "ค่าธรรมเนียมตอนซื้อ ขาย และสับเปลี่ยน เก็บจริงเท่าไหร่",
    why: "จ่ายครั้งเดียวแต่หักจากเงินต้นทันที บางกองยกเว้นให้ จึงต้องดูค่าที่เก็บจริง",
    where: "Factsheet ส่วนค่าธรรมเนียมที่เรียกเก็บจากผู้ถือหน่วยลงทุน",
  },
  {
    q: "ป้องกันความเสี่ยงค่าเงินแค่ไหน",
    why: "ถ้าไม่ป้องกันหรือป้องกันตามดุลยพินิจ ผลตอบแทนเป็นบาทอาจต่างจากกองทุนหลักได้มาก",
    where: "Factsheet ส่วนความเสี่ยงจากอัตราแลกเปลี่ยน หรือการป้องกันความเสี่ยงค่าเงิน",
  },
  {
    q: "เงินกระจุกอยู่ที่ไหนมากเกินไปไหม",
    why: "ถ้าลงในหลักทรัพย์ ประเทศ หรือกลุ่มธุรกิจไม่กี่แห่ง เวลาส่วนนั้นมีปัญหากองจะกระทบมาก",
    where: "Factsheet ตารางทรัพย์สินที่ลงทุน 5 หรือ 10 อันดับแรก และสัดส่วนตามประเทศหรือกลุ่มธุรกิจ",
  },
  {
    q: "ขายคืนแล้วได้เงินเมื่อไหร่ มีเงื่อนไขอะไรไหม",
    why: "ถ้าอาจต้องใช้เงินเร็ว ควรรู้ว่ากองเปิดขายคืนวันไหนและเงินเข้าบัญชีกี่วัน",
    where: "Factsheet ส่วนข้อมูลการซื้อและขายคืน (วันทำการขายคืน ระยะเวลารับเงิน)",
  },
  {
    q: "ระดับความเสี่ยงของกองเหมาะกับที่เรารับได้ไหม",
    why: "กองเดียวกันอาจเหมาะกับบางคน แต่ไม่เหมาะกับอีกคน ขึ้นกับเป้าหมายและระยะเวลาลงทุน",
    where: "Factsheet ส่วนบนสุด (ระดับความเสี่ยง) เทียบกับผลแบบประเมินความเสี่ยงของเราเอง",
  },
];

export default function ChecklistPage() {
  return (
    <AppShell sampleNote={false}>
      <PageHeader
        label="เช็กลิสต์ก่อนซื้อ"
        title="ก่อนซื้อกองไหน"
        mark={`เปิดดู ${ITEMS.length} เรื่องนี้`}
        text="น้อง Lensy ไม่บอกว่าควรซื้อหรือไม่ แต่บอกได้ว่าต้องดูอะไรในเอกสาร และหาได้ตรงไหน ติ๊กไปทีละข้อได้เลยค่ะ"
        pose="shield"
      />

      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-8">
        {/* steps: a round mark per item (number, then a check when ticked), joined by a line */}
        <ol className="m-0 flex list-none flex-col p-0">
          {ITEMS.map((it, i) => (
            <li key={it.q} className="group relative flex gap-4 pb-9 last:pb-0 md:gap-5">
              <span aria-hidden="true" className="absolute bottom-0 left-[21px] top-12 w-px bg-line group-last:hidden" />
              <span className="relative shrink-0">
                <input id={`check-${i}`} type="checkbox" className="peer absolute inset-0 z-10 h-11 w-11 cursor-pointer opacity-0" />
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-brand/30 bg-surface text-[16px] font-bold text-brand transition peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2"
                >
                  <span className="group-has-[:checked]:hidden">{i + 1}</span>
                  <Check size={20} strokeWidth={3} className="hidden group-has-[:checked]:block" />
                </span>
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1.5">
                <label htmlFor={`check-${i}`} className="cursor-pointer text-[19px] font-bold leading-snug text-ink group-has-[:checked]:text-brand">
                  {it.q}
                </label>
                <p className="m-0 text-[16px] leading-[1.75] text-ink-body">{it.why}</p>
                <p className="m-0 mt-1 flex gap-2.5 rounded-xl bg-brand-tint px-3.5 py-2.5 text-[14.5px] leading-relaxed text-ink-body">
                  <FileText aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-brand" />
                  <span>
                    <b className="text-ink">ดูตรงไหนในเอกสาร</b> · {it.where}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-3 border-t border-line pt-6">
          <p className="m-0 text-[13.5px] text-ink-muted">ตำแหน่งในเอกสารเป็นรูปแบบที่พบบ่อยของ Fund Fact Sheet แต่ละกองอาจวางต่างกันเล็กน้อย</p>
        </div>
      </div>
    </AppShell>
  );
}

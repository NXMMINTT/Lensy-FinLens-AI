import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/finlens/app/AppShell";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { Disclaimer } from "@/components/finlens/Disclaimer";

export const metadata: Metadata = {
  title: "เช็กลิสต์ก่อนซื้อกอง | FinLens AI",
  description: "สิ่งที่ควรเปิดดูในเอกสารกองทุนก่อนตัดสินใจ ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

type Item = { q: string; why: string; where: string; link: { href: string; label: string } };

/** What to look at in the documents. Where-to-look is the usual Fund Fact Sheet layout; it can differ per fund. */
const ITEMS: Item[] = [
  {
    q: "ต้นทุนต่อปีรวมทุกชั้นกี่เปอร์เซ็นต์",
    why: "ค่าใช้จ่ายรายปีถูกหักทุกปีและทบไปเรื่อย ๆ ส่วนต่างเล็ก ๆ กลายเป็นเงินก้อนเมื่อถือนาน",
    where: "Factsheet ส่วนค่าธรรมเนียมที่เรียกเก็บจากกองทุน (ค่าใช้จ่ายรวม หรือ TER)",
    link: { href: "/calculator", label: "ดูต้นทุนรวมเป็นบาท" },
  },
  {
    q: "เป็นกองฟีดเดอร์ไหม มีค่าใช้จ่ายของกองทุนหลักอีกชั้นหรือเปล่า",
    why: "ชั้นนี้มักไม่อยู่ใน Factsheet ถ้าดูแค่ TER ของกองไทย อาจเห็นต้นทุนต่ำกว่าจริง",
    where: "Factsheet ส่วนนโยบายการลงทุน (ชื่อกองทุนหลัก) และหนังสือชี้ชวน ส่วนข้อมูลกองทุนหลัก",
    link: { href: "/glossary#master-expense", label: "ค่าใช้จ่ายของกองทุนหลักคืออะไร" },
  },
  {
    q: "ค่าธรรมเนียมตอนซื้อ ขาย และสับเปลี่ยน เก็บจริงเท่าไหร่",
    why: "จ่ายครั้งเดียวแต่หักจากเงินต้นทันที บางกองยกเว้นให้ จึงต้องดูค่าที่เก็บจริง",
    where: "Factsheet ส่วนค่าธรรมเนียมที่เรียกเก็บจากผู้ถือหน่วยลงทุน",
    link: { href: "/compare", label: "เทียบค่าธรรมเนียมของ 2 กอง" },
  },
  {
    q: "ป้องกันความเสี่ยงค่าเงินแค่ไหน",
    why: "ถ้าไม่ป้องกันหรือป้องกันตามดุลยพินิจ ผลตอบแทนเป็นบาทอาจต่างจากกองทุนหลักได้มาก",
    where: "Factsheet ส่วนความเสี่ยงจากอัตราแลกเปลี่ยน หรือการป้องกันความเสี่ยงค่าเงิน",
    link: { href: "/glossary#fx-hedge", label: "การป้องกันความเสี่ยงค่าเงินคืออะไร" },
  },
  {
    q: "เงินกระจุกอยู่ที่ไหนมากเกินไปไหม",
    why: "ถ้าลงในหลักทรัพย์ ประเทศ หรือกลุ่มธุรกิจไม่กี่แห่ง เวลาส่วนนั้นมีปัญหากองจะกระทบมาก",
    where: "Factsheet ตารางทรัพย์สินที่ลงทุน 5 หรือ 10 อันดับแรก และสัดส่วนตามประเทศหรือกลุ่มธุรกิจ",
    link: { href: "/explain", label: "ดูความเสี่ยงทีละกอง" },
  },
  {
    q: "ขายคืนแล้วได้เงินเมื่อไหร่ มีเงื่อนไขอะไรไหม",
    why: "ถ้าอาจต้องใช้เงินเร็ว ควรรู้ว่ากองเปิดขายคืนวันไหนและเงินเข้าบัญชีกี่วัน",
    where: "Factsheet ส่วนข้อมูลการซื้อและขายคืน (วันทำการขายคืน ระยะเวลารับเงิน)",
    link: { href: "/glossary#settlement", label: "T+ คืออะไร" },
  },
  {
    q: "ระดับความเสี่ยงของกองเหมาะกับที่เรารับได้ไหม",
    why: "กองเดียวกันอาจเหมาะกับบางคน แต่ไม่เหมาะกับอีกคน ขึ้นกับเป้าหมายและระยะเวลาลงทุน",
    where: "Factsheet ส่วนบนสุด (ระดับความเสี่ยง) เทียบกับผลแบบประเมินความเสี่ยงของเราเอง",
    link: { href: "/glossary#risk-level", label: "ระดับความเสี่ยงดูยังไง" },
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

      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {ITEMS.map((it, i) => (
          <li key={it.q} className="rounded-[20px] border border-line bg-surface p-5 has-[:checked]:border-brand has-[:checked]:bg-brand-tint">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[#1A7637]" />
              <span className="flex flex-col gap-1.5">
                <b className="text-[17px] leading-snug">
                  {i + 1}. {it.q}
                </b>
                <span className="text-[15px] text-ink-body">{it.why}</span>
                <span className="text-[14px] text-ink-muted">
                  <b className="text-ink-body">ดูที่:</b> {it.where}
                </span>
              </span>
            </label>
            <Link href={it.link.href} className="ml-8 mt-2 inline-block text-[14px] font-bold text-brand underline-offset-4 hover:underline">
              {it.link.label} →
            </Link>
          </li>
        ))}
      </ol>

      <p className="m-0 text-[13px] text-ink-muted">ตำแหน่งในเอกสารเป็นรูปแบบที่พบบ่อยของ Fund Fact Sheet แต่ละกองอาจวางต่างกันเล็กน้อย</p>
      <Disclaimer />
    </AppShell>
  );
}

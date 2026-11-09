import Link from "next/link";

import { LearnCard } from "../learn/LearnCard";
import { Lensy, type LensyPose } from "../Lensy";

type Tile = { title: string; text: string; pose: LensyPose; href: string };

/** The core of FinLens: big tiles. */
const MAIN: Tile[] = [
  { title: "เทียบกองทุน", text: "ค่าใช้จ่ายทุกชั้นของหลายกองเคียงกัน", pose: "magnifier", href: "/compare" },
  { title: "ดูทีละกอง", text: "ค่าใช้จ่าย ซ่อนอยู่หน้าไหน เสี่ยงเรื่องไหน", pose: "checklist", href: "/explain" },
  { title: "เสียค่าธรรมเนียมไปกี่บาท", text: "คำนวณเป็นเงิน ตามจำนวนปีที่ถือ", pose: "coins", href: "/calculator" },
  { title: "ถามน้อง Lensy", text: "ศัพท์และเรื่องการเงิน ถามได้เลย", pose: "idea", href: "/chat" },
];

/** Background reading: small tiles. */
const LEARN: Tile[] = [
  { title: "คลังศัพท์กองทุน", text: "TER ฟีดเดอร์ ค่าเงิน อธิบายง่าย ๆ", pose: "question", href: "/glossary" },
  { title: "เช็กลิสต์ก่อนซื้อ", text: "ต้องเปิดดูอะไรในเอกสารบ้าง", pose: "shield", href: "/checklist" },
  { title: "ข้อมูลหุ้น", text: "P/E P/BV ปันผล Beta ของหุ้นไทย", pose: "chart", href: "/stocks" },
];

function GroupTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="m-0 text-[18px] font-bold">{children}</h2>
      {aside}
    </div>
  );
}

const CARD = "flex items-center gap-3 rounded-[22px] border text-ink no-underline transition hover:-translate-y-0.5 hover:border-brand";

export function FeatureMenu() {
  return (
    <nav aria-label="เมนูฟีเจอร์" className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <GroupTitle>ใช้งานหลัก</GroupTitle>
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
          {MAIN.map((t) => (
            <Link key={t.href} href={t.href} className={`${CARD} border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,46,34,.05)]`}>
              <Lensy pose={t.pose} size={84} />
              <span className="flex flex-col gap-1">
                <b className="text-[18px] leading-snug">{t.title}</b>
                <span className="text-[14px] leading-snug text-ink-muted">{t.text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <GroupTitle>ความรู้ก่อนลงทุน</GroupTitle>
        <div className="grid gap-3 sm:grid-cols-3 md:gap-4">
          {LEARN.map((t) => (
            <Link key={t.href} href={t.href} className={`${CARD} border-line bg-surface px-3 py-3`}>
              <Lensy pose={t.pose} size={52} />
              <span className="flex flex-col">
                <b className="text-[15px] leading-snug">{t.title}</b>
                <span className="text-[13px] leading-snug text-ink-muted">{t.text}</span>
              </span>
            </Link>
          ))}
        </div>
        <LearnCard wide />
      </section>
    </nav>
  );
}

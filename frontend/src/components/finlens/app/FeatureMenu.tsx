import Link from "next/link";

import { Lensy, type LensyPose } from "../Lensy";

type Tile = {
  title: string;
  text: string;
  pose: LensyPose;
  href: string;
  badge?: "new" | "soon";
};

/** Dashboard menu: one page per tile. "soon" tiles open a page that explains the Premium feature. */
const TILES: Tile[] = [
  { title: "เทียบกองทุน", text: "ค่าธรรมเนียมแฝง 2–3 กองเคียงกัน", pose: "magnifier", href: "/compare" },
  { title: "ดูทีละกอง", text: "ค่าใช้จ่าย เสียกี่บาท ความเสี่ยง", pose: "checklist", href: "/explain" },
  { title: "คำนวณเป็นบาท", text: "ค่าธรรมเนียมกินเงินไปเท่าไหร่", pose: "coins", href: "/calculator" },
  { title: "ถามน้อง Lensy", text: "ศัพท์การเงิน ถามได้เลย", pose: "idea", href: "/chat" },
  { title: "คลังศัพท์กองทุน", text: "TER ฟีดเดอร์ ค่าเงิน อธิบายง่าย ๆ", pose: "question", href: "/glossary", badge: "new" },
  { title: "เช็กลิสต์ก่อนซื้อ", text: "ต้องเปิดดูอะไรในเอกสารบ้าง", pose: "shield", href: "/checklist", badge: "new" },
  { title: "ข้อมูลหุ้น", text: "P/E P/BV ปันผล Beta ของหุ้นไทย 20 ตัว", pose: "chart", href: "/stocks", badge: "new" },
  { title: "ส่องพอร์ต", text: "รวมค่าใช้จ่ายทุกกองที่ถือ", pose: "chart", href: "/portfolio", badge: "soon" },
  { title: "เช็กก่อนเชื่อ", text: "เทียบคำโฆษณากับเอกสารจริง", pose: "laptop", href: "/claim-check", badge: "soon" },
  { title: "อัปเกรด Premium", text: "ดูฟีเจอร์และราคา", pose: "heart", href: "/premium" },
];

function Badge({ kind }: { kind: "new" | "soon" }) {
  return kind === "new" ? (
    <span className="absolute -right-1.5 -top-2 rounded-full bg-brand px-2.5 py-0.5 text-[12px] font-bold text-white shadow-sm">ใหม่</span>
  ) : (
    <span className="absolute -right-1.5 -top-2 whitespace-nowrap rounded-full bg-sun px-2.5 py-0.5 text-[11.5px] font-bold text-[#4A3500] shadow-sm">Premium · เร็ว ๆ นี้</span>
  );
}

function TileBody({ t }: { t: Tile }) {
  return (
    <>
      {t.badge && <Badge kind={t.badge} />}
      <Lensy pose={t.pose} size={72} className={t.badge === "soon" ? "opacity-75" : ""} />
      <b className="text-[16px] leading-snug">{t.title}</b>
      <span className="text-[13.5px] leading-snug text-ink-muted">{t.text}</span>
    </>
  );
}

const TILE = "relative flex flex-col items-center gap-1.5 rounded-[22px] px-3 pb-4 pt-3 text-center";

export function FeatureMenu() {
  return (
    <nav aria-label="เมนูฟีเจอร์" className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
      {TILES.map((t) => (
        <Link
          key={t.title}
          href={t.href}
          className={`${TILE} border text-ink no-underline transition hover:-translate-y-0.5 hover:border-brand ${
            t.badge === "soon" ? "border-dashed border-line bg-surface/60" : "border-line bg-surface shadow-[0_4px_14px_rgba(20,46,34,.05)]"
          }`}
        >
          <TileBody t={t} />
        </Link>
      ))}
    </nav>
  );
}

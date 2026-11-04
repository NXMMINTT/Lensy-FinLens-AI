import Image from "next/image";

// Colors copied from backend/app/line_messages/assets/flex_confirm_{income,expense}.json
const THEME = {
  income: { label: "รายรับ", main: "#1A7637", ink: "#11823B", tint: "#E7F8EE", rowBg: "#E7F8EE99" },
  expense: { label: "รายจ่าย", main: "#E8335A", ink: "#C21F45", tint: "#FDECF0", rowBg: "#FDECF099" },
};

const ROW_ICON = { date: "calendar", category: "category", note: "note" };

/** Compact copy of the LINE Flex card U-Fox sends to confirm an entry. */
export function ConfirmCard({
  kind,
  amount,
  quote,
  rows = [],
}: {
  kind: keyof typeof THEME;
  amount: string;
  quote: string;
  rows?: [keyof typeof ROW_ICON, string, string][];
}) {
  const t = THEME[kind];
  return (
    <div className="w-[215px] shrink-0 self-start overflow-hidden rounded-[14px] bg-[#FFFFFF] text-[#1B2559]">
      <Image src={`/line/banner-${kind}.jpg`} alt="" width={1040} height={294} sizes="215px" className="h-auto w-full" />
      <div className="px-2.5 pt-2">
        <div className="flex items-center justify-between">
          <span className="rounded-xl px-2 py-px text-[10px] font-bold" style={{ background: t.tint, color: t.ink }}>{t.label}</span>
          <span className="text-[10px] text-[#8A91A3]">ตรวจสอบก่อนบันทึก</span>
        </div>
        <div className="mt-1 text-[22px] font-bold leading-tight" style={{ color: t.main }}>
          {kind === "income" ? "+" : "-"}฿{amount}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex-1 text-[9px] text-[#8A91A3]">“{quote}”</span>
          <span className="flex shrink-0 items-center gap-1 rounded-[14px] px-2 py-0.5 text-[10px] font-bold" style={{ background: t.tint, color: t.ink }}>
            <Image src={`/line/icon-edit-${kind}.png`} alt="" width={12} height={12} />
            แก้ยอด
          </span>
        </div>
        {rows.length > 0 && (
          <div className="mt-1.5 flex flex-col gap-1">
            {rows.map(([icon, label, value]) => (
              <div key={label} className="flex items-center gap-2 rounded-[12px] px-2 py-1" style={{ background: t.rowBg }}>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg" style={{ background: t.main }}>
                  <Image src={`/line/icon-${ROW_ICON[icon]}-white.png`} alt="" width={13} height={13} />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[9px] text-[#8A91A3]">{label}</span>
                  <b className="block truncate">{value}</b>
                </span>
                <span className="rounded-lg bg-[#FFFFFF] px-2 py-0.5 text-[10px] font-bold" style={{ color: t.ink }}>แก้ไข</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="px-2.5 pb-1 pt-2">
        <span className="block rounded-md py-1.5 text-center font-bold text-[#FFFFFF]" style={{ background: t.main }}>✓ ยืนยันบันทึก</span>
        <span className="block py-1 text-center text-[#8A91A3]">ยกเลิก</span>
      </div>
    </div>
  );
}

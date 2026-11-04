import { RadarCard, RadarShell } from "@/components/home/phone/RadarShell";

/** Radar step 2: where the same product sells, plus the competitor price summary (numbers from mock-data P001). */
export function WhereToSellScreen() {
  const shares: [string, number][] = [
    ["TikTok Shop", 51],
    ["Shopee", 28],
    ["Lazada", 15],
    ["Amazon", 6],
  ];
  const summary: [string, string, string?][] = [
    ["ราคาที่แนะนำ", "฿110"],
    ["ต้นทุนสินค้า", "฿55"],
    ["ราคากลางตลาด", "฿110"],
    ["ราคาของร้านคุณ", "฿120", "+฿10 จากราคากลาง"],
  ];
  return (
    <RadarShell>
      <RadarCard title="ขายที่ไหนดี" subtitle="สัดส่วนยอดขายสินค้าแบบเดียวกัน แยกตามแพลตฟอร์ม">
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {shares.map(([platform, pct], i) => (
            <li key={platform} className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>{platform}</span>
                <b className="tabular-nums">{pct}%</b>
              </div>
              <div className="h-2 rounded-full bg-brand-soft">
                <div className={`h-full rounded-full ${i === 0 ? "bg-brand" : "bg-brand-light"}`} style={{ width: `${(pct / shares[0][1]) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </RadarCard>
      <RadarCard title="คู่แข่งขายเท่าไหร่" subtitle="6 ร้านในไทย · ราคากลาง ฿110">
        <div className="grid grid-cols-2 gap-1.5">
          {summary.map(([label, value, sub], i) => (
            <div key={label} className="rounded-[12px] bg-brand-soft px-2 py-1.5">
              <div className="text-[10px] text-ink-muted">{label}</div>
              <b className={`text-[15px] leading-tight ${i === summary.length - 1 ? "text-brand" : "text-ink"}`}>{value}</b>
              {sub && <div className="text-[9px] font-semibold text-success-ink">{sub}</div>}
            </div>
          ))}
        </div>
      </RadarCard>
    </RadarShell>
  );
}

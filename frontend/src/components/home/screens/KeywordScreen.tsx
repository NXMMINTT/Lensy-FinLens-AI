import { RadarCard, RadarShell } from "@/components/home/phone/RadarShell";

/** Radar step 3: trending search terms and the EU export card (numbers from mock-data P001). */
export function KeywordScreen() {
  const keywords: [string, string, string, boolean][] = [
    ["ของฝากไทย", "Lazada", "15.2k", false],
    ["น้ำพริกเผา", "Shopee", "12.4k", true],
    ["น้ำพริกแท้ไม่ใส่สารกันบูด", "TikTok Shop", "8.9k", true],
    ["thai chili paste", "Amazon", "3.1k", true],
  ];
  return (
    <RadarShell>
      <RadarCard title="ลูกค้าค้นหาคำว่า">
        <ol className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0">
          {keywords.map(([keyword, platform, volume, hot]) => (
            <li key={keyword} className="flex items-center justify-between gap-2 py-1 first:pt-0 last:pb-0">
              <div className="min-w-0 leading-tight">
                <div className="truncate font-semibold">{keyword}</div>
                <div className="text-[10px] text-ink-muted">{platform}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {hot && <span className="rounded-full bg-success-soft px-1.5 text-[9px] font-bold text-success-ink">มาแรง</span>}
                <span className="w-8 text-right tabular-nums text-ink-body">{volume}</span>
              </div>
            </li>
          ))}
        </ol>
      </RadarCard>
      <RadarCard title="ส่งไปยุโรปได้ไหม" subtitle="Germany / Netherlands">
        <div className="grid grid-cols-2 gap-1.5">
          {[["ราคาปลีก", "€6.50", "≈ ฿254"], ["ราคาส่งแนะนำ", "€3.80", "≈ ฿148"]].map(([label, eur, thb]) => (
            <div key={label} className="rounded-[12px] bg-brand-tint px-2 py-1.5">
              <div className="text-[10px] text-ink-muted">{label}</div>
              <b className="text-[15px] leading-tight text-ink">{eur}</b>
              <div className="text-[10px] text-ink-muted">{thb}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span>ความต้องการตลาด</span>
            <b className="tabular-nums">82/100</b>
          </div>
          <div className="h-2 rounded-full bg-success-soft">
            <div className="h-full w-[82%] rounded-full bg-[#22B862]" />
          </div>
        </div>
      </RadarCard>
    </RadarShell>
  );
}

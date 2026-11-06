"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Figure, Stock, StockFigureKey } from "@/lib/stocks";

type SortKey = "symbol" | StockFigureKey;

/** Column headings. Plain descriptions of the data: no advice, no price targets. */
const COLUMNS: { key: StockFigureKey; label: string; unit?: string; term?: string }[] = [
  { key: "closePrice", label: "ราคาปิด", unit: "บาท" },
  { key: "marketCap", label: "มูลค่าตลาด", unit: "ล้านบาท", term: "market-cap" },
  { key: "pe", label: "P/E", unit: "เท่า", term: "pe" },
  { key: "pbv", label: "P/BV", unit: "เท่า", term: "pbv" },
  { key: "dividendYield", label: "Dividend Yield", unit: "%", term: "dividend-yield" },
  { key: "beta", label: "Beta", term: "beta" },
  { key: "ytdChange", label: "เปลี่ยนแปลงตั้งแต่ต้นปี", unit: "%" },
  { key: "freeFloat", label: "Free Float", unit: "%", term: "free-float" },
  { key: "lastDividend", label: "ปันผลล่าสุด", unit: "บาท/หุ้น" },
];

/** Each stock links to the glossary for these terms. */
const TERMS = [
  { id: "pe", label: "P/E" },
  { id: "pbv", label: "P/BV" },
  { id: "dividend-yield", label: "Div. Yield" },
  { id: "beta", label: "Beta" },
];

/** As written in the file; whole numbers get thousands separators (the value is unchanged). */
function show(f: Figure): string {
  if (!f) return "ไม่พบในเอกสาร";
  return /^-?\d+$/.test(f.raw) ? Number(f.raw).toLocaleString("th-TH") : f.raw;
}

function compare(a: Stock, b: Stock, key: SortKey): number {
  if (key === "symbol") return a.symbol.localeCompare(b.symbol);
  const x = a.figures[key]?.value;
  const y = b.figures[key]?.value;
  if (x === undefined && y === undefined) return 0;
  if (x === undefined) return 1; // empty cells last
  if (y === undefined) return -1;
  return x - y;
}

export function StocksTable({ stocks }: { stocks: Stock[] }) {
  const industries = useMemo(() => [...new Set(stocks.map((s) => s.industry))], [stocks]);
  const [industry, setIndustry] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "marketCap", dir: -1 });

  const shown = useMemo(() => {
    const rows = industry ? stocks.filter((s) => s.industry === industry) : stocks;
    return [...rows].sort((a, b) => {
      const c = compare(a, b, sort.key);
      // keep empty cells at the bottom in both directions
      const emptyA = sort.key !== "symbol" && !a.figures[sort.key];
      const emptyB = sort.key !== "symbol" && !b.figures[sort.key];
      if (emptyA || emptyB) return c;
      return c * sort.dir;
    });
  }, [stocks, industry, sort]);

  const sortBy = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === "symbol" ? 1 : -1 }));
  const ariaSort = (key: SortKey) => (sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none");
  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === 1 ? "↑" : "↓") : "↕");

  return (
    <div className="flex flex-col gap-4">
      {/* industry filter */}
      <div role="group" aria-label="กรองตามกลุ่มอุตสาหกรรม" className="flex flex-wrap items-center gap-2">
        <span className="text-[14px] text-ink-muted">กลุ่มอุตสาหกรรม:</span>
        {[null, ...industries].map((name) => {
          const on = industry === name;
          const count = name ? stocks.filter((s) => s.industry === name).length : stocks.length;
          return (
            <button
              key={name ?? "all"}
              type="button"
              aria-pressed={on}
              onClick={() => setIndustry(name)}
              className={`min-h-[40px] rounded-full border px-3.5 text-[14px] font-semibold ${on ? "border-brand bg-brand-soft text-ink" : "border-line bg-surface text-ink-muted hover:border-brand"}`}
            >
              {name ?? "ทั้งหมด"} <span className="font-normal text-ink-faint">({count})</span>
            </button>
          );
        })}
      </div>

      <p className="m-0 text-[13px] text-ink-muted">กดหัวคอลัมน์เพื่อเรียงลำดับ · แสดง {shown.length} จาก {stocks.length} หุ้น</p>

      <div className="overflow-x-auto rounded-[20px] border border-line bg-surface">
        <table className="w-full min-w-[1320px] border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-line bg-brand-tint text-left align-bottom">
              <th scope="col" aria-sort={ariaSort("symbol")} className="sticky left-0 z-10 bg-brand-tint p-0">
                <button type="button" onClick={() => sortBy("symbol")} className="flex w-full items-center gap-1 p-3 text-left font-bold text-ink">
                  หุ้น <span aria-hidden="true" className="text-ink-faint">{arrow("symbol")}</span>
                </button>
              </th>
              <th scope="col" className="p-3 font-bold text-ink">
                กลุ่ม
              </th>
              {COLUMNS.map((c) => (
                <th key={c.key} scope="col" aria-sort={ariaSort(c.key)} className="p-0 text-right">
                  <button type="button" onClick={() => sortBy(c.key)} className="flex w-full items-end justify-end gap-1 whitespace-nowrap p-3 text-right font-bold text-ink">
                    <span>
                      {c.label}
                      {c.unit && <span className="block text-[11.5px] font-normal text-ink-muted">({c.unit})</span>}
                    </span>
                    <span aria-hidden="true" className="text-ink-faint">
                      {arrow(c.key)}
                    </span>
                  </button>
                </th>
              ))}
              <th scope="col" className="p-3 font-bold text-ink">
                XD ล่าสุด
              </th>
              <th scope="col" className="p-3 font-bold text-ink">
                อธิบายศัพท์
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => (
              <tr key={s.symbol} className="border-b border-line-subtle align-top last:border-0">
                <th scope="row" className="sticky left-0 z-10 min-w-[230px] bg-surface p-3 text-left font-normal">
                  <b className="block text-[15px] text-ink">{s.symbol}</b>
                  <span className="block text-[12.5px] leading-snug text-ink-muted">{s.companyName}</span>
                </th>
                <td className="min-w-[170px] p-3 text-[13px] text-ink-body">
                  {s.industry}
                  <span className="block text-[12px] text-ink-muted">{s.sector}</span>
                </td>
                {COLUMNS.map((c) => {
                  const f = s.figures[c.key];
                  const negative = c.key === "ytdChange" && f && f.value < 0;
                  return (
                    <td key={c.key} className={`whitespace-nowrap p-3 text-right tabular-nums ${f ? (negative ? "text-danger-ink" : "text-ink") : "text-[12.5px] text-ink-muted"}`}>
                      {show(f)}
                    </td>
                  );
                })}
                <td className="whitespace-nowrap p-3 text-[13px] text-ink-body">{s.lastXD ?? "ไม่พบในเอกสาร"}</td>
                <td className="p-3">
                  <span className="grid min-w-[140px] grid-cols-2 gap-1">
                    {TERMS.map((t) => (
                      <Link
                        key={t.id}
                        href={`/glossary#${t.id}`}
                        aria-label={`อธิบายศัพท์ ${t.label}`}
                        className="whitespace-nowrap rounded-full border border-line px-2 py-0.5 text-center text-[12px] font-semibold text-brand no-underline hover:border-brand hover:bg-brand-soft"
                      >
                        {t.label} ?
                      </Link>
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

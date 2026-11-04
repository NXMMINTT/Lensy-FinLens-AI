"use client";

import { useMemo, useState } from "react";

import type { CatalogPlatform, CatalogProduct } from "@/types/market";
import { platformColor } from "@/lib/market/platformColor";

const baht = (v: number) => `฿${Math.round(v).toLocaleString("en-US")}`;
type Sort = "price" | "drop" | "name";

/** 8-week price history as a ranked list — one row per platform in a single
 *  block. Each row shows the current price, a bar for its position in the
 *  cross-platform price range, a tiny sparkline for the 8-week trend, and the
 *  change vs. 8 weeks ago. Everything is sorted so the cheapest sits on top. */
export function PriceHistoryChart({
  history,
  platforms,
}: {
  history: CatalogProduct["price_history"];
  platforms: CatalogPlatform[];
}) {
  const names = useMemo(() => Object.fromEntries(platforms.map((p) => [p.id, p.name])), [platforms]);
  const [sort, setSort] = useState<Sort>("price");

  const rowsAll = useMemo(() => {
    return Object.keys(history.series).map((id) => {
      const values = history.series[id];
      const nums = values.filter((v): v is number => typeof v === "number");
      const first = nums[0] ?? 0;
      const last = nums[nums.length - 1] ?? 0;
      const min = nums.length ? Math.min(...nums) : 0;
      const max = nums.length ? Math.max(...nums) : 0;
      return {
        id,
        name: names[id] ?? id,
        values,
        first,
        last,
        min,
        max,
        changePct: first ? ((last - first) / first) * 100 : 0,
      };
    });
  }, [history.series, names]);

  const rows = useMemo(() => {
    const r = [...rowsAll];
    if (sort === "price") r.sort((a, b) => a.last - b.last);
    else if (sort === "drop") r.sort((a, b) => a.changePct - b.changePct);
    else r.sort((a, b) => a.name.localeCompare(b.name, "th"));
    return r;
  }, [rowsAll, sort]);

  const lo = Math.min(...rowsAll.map((r) => r.last));
  const hi = Math.max(...rowsAll.map((r) => r.last));
  const span = hi - lo || 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" className="flex gap-1.5">
          {([
            ["price", "ราคาถูก→แพง"],
            ["drop", "ลดราคามากสุด"],
            ["name", "ชื่อ A→Z"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={sort === key}
              onClick={() => setSort(key)}
              className={`min-h-[32px] rounded-full px-3 text-xs font-semibold ${
                sort === key ? "bg-navy text-white" : "border border-line bg-surface text-ink-body"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-ink-faint">
          ช่วงราคาตอนนี้ <b className="text-ink-body">{baht(lo)}–{baht(hi)}</b> · 8 สัปดาห์
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-line">
        {rows.map((r, i) => {
          const pos = ((r.last - lo) / span) * 100; // 0 = cheapest, 100 = priciest
          const color = platformColor(r.name);
          const isCheapest = r.last === lo;
          const isPriciest = r.last === hi && hi !== lo;
          const down = r.changePct < -0.5;
          const up = r.changePct > 0.5;
          const trendTone = down ? "text-income" : up ? "text-expense" : "text-ink-faint";
          const arrow = down ? "↓" : up ? "↑" : "→";

          return (
            <div
              key={r.id}
              className={`grid grid-cols-[150px_1fr_84px_60px] items-center gap-3 px-3 py-2 text-sm ${
                i === 0 ? "" : "border-t border-line-subtle"
              } ${isCheapest ? "bg-success-soft" : ""}`}
            >
              {/* name */}
              <div className="flex min-w-0 items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: color }} />
                <span className="truncate font-semibold text-ink-body">{r.name}</span>
                {isCheapest && <span className="rounded-full bg-income-solid px-1.5 py-0.5 text-[10px] font-bold text-white">ถูกสุด</span>}
                {isPriciest && <span className="rounded-full bg-line-subtle px-1.5 py-0.5 text-[10px] font-bold text-ink-faint">แพงสุด</span>}
              </div>

              {/* price-position bar vs. other platforms this week */}
              <div className="flex items-center gap-2">
                <span className="w-14 text-right text-[13px] font-bold tabular-nums text-ink">{baht(r.last)}</span>
                <div className="relative h-2 flex-1 rounded-full bg-line-subtle">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${Math.max(2, pos)}%`, background: color, opacity: 0.9 }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute top-1/2 -mt-1.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-surface shadow"
                    style={{ left: `${pos}%`, background: color }}
                  />
                </div>
              </div>

              {/* 8-week sparkline */}
              <Sparkline values={r.values} color={color} />

              {/* trend vs 8 weeks ago */}
              <span className={`text-right text-[12px] font-semibold tabular-nums ${trendTone}`}>
                {arrow} {Math.abs(r.changePct).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-ink-faint">
        แถบแนวนอน = ตำแหน่งราคาเทียบระหว่างแพลตฟอร์มสัปดาห์นี้ · เส้นเล็ก = ราคา 8 สัปดาห์
      </p>
    </div>
  );
}

function Sparkline({ values, color }: { values: (number | null)[]; color: string }) {
  const w = 80;
  const h = 24;
  const nums = values.filter((v): v is number => typeof v === "number");
  if (!nums.length) return <svg viewBox={`0 0 ${w} ${h}`} className="w-full" />;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;
  const n = values.length;
  const x = (i: number) => (w * i) / Math.max(1, n - 1);
  const y = (v: number) => 2 + ((h - 4) * (max - v)) / span;
  const pts = values
    .map((v, i) => (typeof v === "number" ? `${x(i).toFixed(1)},${y(v).toFixed(1)}` : null))
    .filter((p): p is string => p !== null)
    .join(" ");
  const lastV = values[n - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      {typeof lastV === "number" && <circle cx={x(n - 1)} cy={y(lastV)} r="2" fill={color} />}
    </svg>
  );
}

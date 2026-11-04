"use client";

import { useState } from "react";

import { UFox } from "@/components/brand/UFox";
import { Ring } from "@/components/ui/Ring";

const THRESHOLD = 1_800_000;

const ZONES = [
  { upTo: 0.6, mood: "happy", color: "#34C27A", chip: "bg-success-soft text-success-ink", label: "โซนเขียว", say: "ชิลๆ ยังห่างเพดานอีกเยอะค่ะ ขายต่อเลย!" },
  { upTo: 0.9, mood: "worried", color: "#FFC83D", chip: "bg-sun-soft text-sun-ink", label: "โซนเหลือง", say: "เริ่มใกล้แล้วนะ เก็บใบเสร็จค่าของไว้ให้ครบค่ะ" },
  { upTo: 1, mood: "shocked", color: "#F26B5B", chip: "bg-danger-soft text-expense", label: "โซนแดง", say: "ใกล้มากแล้ว! เตรียมเอกสารจด VAT ได้เลยค่ะ" },
  { upTo: Infinity, mood: "shocked", color: "#F26B5B", chip: "bg-danger-soft text-expense", label: "เกินเพดาน", say: "เกินแล้ว ต้องจด VAT ภายใน 30 วันนับจากวันที่เกินนะคะ" },
] as const;

/** Drag your yearly sales and watch the tax meter (and U-Fox's face) react. */
export function TaxPlayground() {
  const [sales, setSales] = useState(1_250_000);
  const ratio = sales / THRESHOLD;
  const zone = ZONES.find((z) => ratio < z.upTo) ?? ZONES[ZONES.length - 1];

  return (
    <div className="relative flex w-[340px] max-w-full flex-col items-center gap-4 rounded-[30px] bg-surface p-7 shadow-[0_24px_50px_rgba(20,46,34,.14)]">
      <span className="absolute -top-3.5 left-6 rounded-full bg-sun px-3 py-1 text-sm font-bold text-[#4A3500]">ลองเลื่อนดู</span>
      <div className="flex items-center gap-3">
        <UFox size={96} mood={zone.mood} />
        <p className="m-0 min-h-[3.2em] max-w-[200px] text-[15px] font-semibold leading-snug" aria-live="polite">
          {zone.say}
        </p>
      </div>
      <Ring ratio={ratio} color={zone.color} size={170}>
        <div className="text-4xl font-bold leading-none">{Math.round(ratio * 100)}%</div>
        <div className="text-[13px] text-ink-muted">ของเพดาน VAT</div>
      </Ring>
      <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${zone.chip}`}>{zone.label}</span>
      <label className="flex w-full flex-col gap-1.5 text-[15px]">
        <span className="flex justify-between">
          <span className="text-ink-muted">ยอดขายทั้งปี</span>
          <b>฿{sales.toLocaleString("en-US")}</b>
        </span>
        <input
          type="range"
          min={0}
          max={2_000_000}
          step={10_000}
          value={sales}
          onChange={(e) => setSales(Number(e.target.value))}
          className="h-11 w-full cursor-pointer accent-brand"
        />
      </label>
    </div>
  );
}

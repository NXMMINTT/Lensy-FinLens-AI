"use client";

import Link from "next/link";
import { useState } from "react";

import { baht, pct } from "@/lib/money";
import { DEFAULT_ANNUAL_RETURN, MAX_YEARS, MIN_YEARS, trueCost } from "@/lib/trueCost";

import { Lensy } from "../Lensy";
import { MascotDecor } from "../Decor";

/** Two hypothetical yearly costs (not real funds) to show how a small % becomes real baht. */
const COSTS = [0.01, 0.02] as const;

/** "Drag and see": 1% vs 2% a year, in baht, computed by lib/trueCost.ts. */
export function FeeSlider() {
  const [amount, setAmount] = useState(100_000);
  const [years, setYears] = useState(10);

  const rows = COSTS.map((annualCost) => ({
    annualCost,
    r: trueCost({ principal: amount, years, annualReturn: DEFAULT_ANNUAL_RETURN, frontEnd: 0, backEnd: 0, annualCost }),
  }));
  const max = Math.max(...rows.map((x) => x.r.feeCost), 1);
  const diff = rows[1].r.feeCost - rows[0].r.feeCost;

  return (
    <section id="try" aria-labelledby="slider-title" className="scroll-mt-20 px-5 py-16 md:px-6">
      <div className="mx-auto grid max-w-[1100px] items-center gap-10 rounded-[28px] border border-line bg-surface p-6 shadow-[0_10px_30px_rgba(20,46,34,.06)] md:p-10 lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col gap-4">
          <span className="self-start rounded-md bg-brand-soft px-2.5 py-1 text-[14px] font-bold text-brand">ลองเลื่อนดู</span>
          <h2 id="slider-title" className="m-0 text-[30px] font-bold leading-snug md:text-[36px]">
            ต่างกันแค่ <span className="marker-green">1%</span>
            <br />
            แต่เป็นเงินเท่าไหร่?
          </h2>
          <p className="m-0 text-ink-body">ค่าใช้จ่ายรายปีถูกหักทุกปี และทบไปเรื่อย ๆ ตัวเลขเล็ก ๆ จึงกลายเป็นเงินก้อนได้</p>
          <span className="relative self-start max-lg:hidden">
            <Lensy pose="coins" size={120} />
            <MascotDecor />
          </span>
        </div>

        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="flex justify-between">
              <span className="font-semibold">เงินลงทุน</span>
              <b className="text-brand">{amount.toLocaleString("th-TH")} บาท</b>
            </span>
            <input
              type="range"
              min={10_000}
              max={1_000_000}
              step={10_000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-[#1A7637]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="flex justify-between">
              <span className="font-semibold">ถือไว้</span>
              <b className="text-brand">{years} ปี</b>
            </span>
            <input
              type="range"
              min={MIN_YEARS}
              max={MAX_YEARS}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-[#1A7637]"
            />
          </label>

          <div className="flex flex-col gap-3" aria-live="polite">
            {rows.map(({ annualCost, r }, i) => (
              <div key={annualCost} className="flex flex-col gap-1">
                <div className="flex justify-between gap-2">
                  <span>ค่าใช้จ่าย {pct(annualCost, 0)} ต่อปี เสียไป</span>
                  <b>{baht(r.feeCost)}</b>
                </div>
                <div className="h-3 rounded-full bg-line-subtle">
                  <div
                    className={`h-full rounded-full transition-[width] duration-300 ${i === 0 ? "bg-brand-light" : "bg-brand"}`}
                    style={{ width: `${(r.feeCost / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl bg-brand-soft px-4 py-3">
            <span className="font-semibold">ส่วนต่าง</span>
            <span className="text-[28px] font-extrabold leading-none text-brand">{baht(diff)}</span>
          </div>
          <p className="m-0 text-[13px] text-ink-muted">
            ตัวอย่างสมมติ ไม่ใช่ข้อมูลกองทุนจริง · สมมติผลตอบแทน {pct(DEFAULT_ANNUAL_RETURN, 0)} ต่อปีก่อนหักค่าใช้จ่าย ไม่ใช่การคาดการณ์ ·
            คำนวณด้วยสูตร ไม่ได้ให้ AI คิดตัวเลข
          </p>
          <Link href="/compare" className="self-start font-bold text-brand underline-offset-4 hover:underline">
            ลองเทียบค่าธรรมเนียมของกองทุนจริงทีละชั้น →
          </Link>
        </div>
      </div>
    </section>
  );
}

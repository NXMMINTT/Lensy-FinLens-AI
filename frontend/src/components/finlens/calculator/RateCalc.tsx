"use client";

import Link from "next/link";
import { useState } from "react";

import { baht } from "@/lib/money";
import { earned } from "@/lib/rateCalc";
import { refPath, REF_STATUS_LABEL, type RefStatus } from "@/lib/referenceShared";

export type RateRow = {
  key: string;
  topic: string;
  label: string;
  ratePct: number;
  compound: boolean;
  note: string;
  asOf: string;
  status: RefStatus;
};

const AMOUNTS = [10_000, 100_000, 500_000, 1_000_000];

/** Money earned per rate, for a chosen amount and number of years, before tax. Formula only, no AI. */
export function RateCalc({ rows }: { rows: RateRow[] }) {
  const [amount, setAmount] = useState(100_000);
  const [years, setYears] = useState(3);
  const principal = Math.max(0, Math.min(100_000_000, Math.round(amount) || 0));

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="เงินและจำนวนปี" className="grid gap-5 rounded-[24px] border border-line bg-surface p-5 md:grid-cols-2 md:p-6">
        <label className="flex flex-col gap-2">
          <span className="font-semibold">เงินที่จะฝากหรือลงทุน (บาท)</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="min-h-[44px] rounded-xl border border-line bg-surface px-3 text-[17px] text-ink focus:border-brand"
          />
          <span className="flex flex-wrap gap-1.5">
            {AMOUNTS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className={`rounded-full border px-2.5 py-0.5 text-[13px] ${amount === v ? "border-brand bg-brand-soft text-brand" : "border-line text-ink-muted hover:border-brand"}`}
              >
                {v.toLocaleString("th-TH")}
              </button>
            ))}
          </span>
        </label>
        <label className="flex flex-col gap-2">
          <span className="flex justify-between font-semibold">
            จำนวนปี <b className="text-brand">{years} ปี</b>
          </span>
          <input type="range" min={1} max={10} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} className="h-2 cursor-pointer accent-[#1A7637]" />
          <span className="flex justify-between text-[12px] text-ink-faint">
            <span>1</span>
            <span>10</span>
          </span>
        </label>
      </section>

      <section aria-labelledby="rate-result" className="flex flex-col gap-3">
        <h2 id="rate-result" className="m-0 text-[19px] font-bold leading-snug sm:text-[22px]">
          ได้ดอกเบี้ยหรือผลตอบแทนประมาณกี่บาท ใน {years} ปี
        </h2>
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
          {rows.map((r) => (
            <li key={r.key} className="flex flex-col gap-2 rounded-[20px] border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <b className="text-[16px] leading-snug text-ink">{r.label}</b>
                <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-0.5 text-[13px] font-bold text-brand">{r.ratePct}% ต่อปี</span>
              </div>
              <div>
                <div className="text-[13px] text-ink-muted">ได้ประมาณ (ก่อนหักภาษี)</div>
                <div className="font-heading text-[30px] font-bold leading-tight text-brand">{baht(earned(principal, r.ratePct, years, r.compound))}</div>
              </div>
              <p className="m-0 text-[13.5px] leading-relaxed text-ink-body">{r.note}</p>
              <p className="m-0 flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-2 text-[12.5px] text-ink-muted">
                <span>
                  {r.compound ? "สมมติทบต้นปีละครั้ง" : "ดอกเบี้ยไม่ทบต้น"} · ข้อมูล ณ {r.asOf.split(" / ")[0]} · {REF_STATUS_LABEL[r.status]}
                </span>
                <Link href={refPath(r.topic, r.status)} className="font-semibold text-brand no-underline hover:underline">
                  ที่มา
                </Link>
              </p>
            </li>
          ))}
        </ul>
        <p className="m-0 text-[13.5px] text-ink-muted">
          คำนวณด้วยสูตร ไม่ได้ให้ AI คิด อัตราจริงเปลี่ยนได้และแต่ละที่มีเงื่อนไขต่างกัน ดอกเบี้ยเงินฝากและพันธบัตรอาจถูกหักภาษี ณ ที่จ่าย ตรวจกับผู้ให้บริการก่อนตัดสินใจ
        </p>
      </section>
    </div>
  );
}

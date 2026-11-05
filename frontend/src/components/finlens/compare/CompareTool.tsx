"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { CompareFund } from "@/lib/compare";
import { NOT_FOUND } from "@/lib/disclaimer";
import { baht, pct } from "@/lib/money";
import { useTheme } from "@/lib/theme";
import { DEFAULT_ANNUAL_RETURN, MAX_YEARS, MIN_YEARS, trueCost, type TrueCostResult } from "@/lib/trueCost";

import { SampleBadge } from "../SampleBadge";
import { Icon } from "../Icon";
import { CostChart, SERIES_COLORS, type ChartRow, type ChartSeries } from "./CostChart";

const SOURCE_LABEL = { factsheet: "Factsheet", prospectus: "หนังสือชี้ชวน" } as const;
const MAX_FUNDS = 3;

/**
 * "fees": /compare — every fee layer of 2–3 funds side by side, with pages (no baht).
 * "money": /calculator — fee cost in baht for 1–3 funds, with sliders, chart and assumptions.
 */
export type CompareMode = "fees" | "money";
const AMOUNT_PRESETS = [10_000, 100_000, 500_000, 1_000_000];

type Selected = { code: string; slot: number };

function Swatch({ slot }: { slot: number }) {
  const { resolved } = useTheme();
  return <i className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ background: SERIES_COLORS[resolved][slot] }} aria-hidden="true" />;
}

function PageTag({ page, source }: { page: number | null; source: keyof typeof SOURCE_LABEL }) {
  if (page === null) return null;
  return (
    <span className="whitespace-nowrap text-[12px] text-ink-muted">
      หน้า {page} · {SOURCE_LABEL[source]}
    </span>
  );
}

export function CompareTool({ funds, initialCodes, mode }: { funds: CompareFund[]; initialCodes: string[]; mode: CompareMode }) {
  const MIN_FUNDS = mode === "fees" ? 2 : 1;
  // Each fund keeps its color slot while selected, so removing one never repaints the others.
  const [selected, setSelected] = useState<Selected[]>(initialCodes.map((code, slot) => ({ code, slot })));
  const [amount, setAmount] = useState(100_000);
  const [years, setYears] = useState(10);
  const [returnPct, setReturnPct] = useState(DEFAULT_ANNUAL_RETURN * 100);

  const byCode = useMemo(() => new Map(funds.map((f) => [f.code, f])), [funds]);
  const chosen = selected.map((s) => ({ ...s, fund: byCode.get(s.code)! })).filter((s) => s.fund);

  function toggle(code: string) {
    setSelected((cur) => {
      if (cur.some((s) => s.code === code)) return cur.length > MIN_FUNDS ? cur.filter((s) => s.code !== code) : cur;
      if (cur.length >= MAX_FUNDS) return cur;
      const used = new Set(cur.map((s) => s.slot));
      const slot = [0, 1, 2].find((n) => !used.has(n))!;
      return [...cur, { code, slot }];
    });
  }

  // keep the URL shareable (e.g. from LINE) without a page reload
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("funds", selected.map((s) => s.code).join(","));
    window.history.replaceState(null, "", url);
  }, [selected]);

  const principal = Math.max(0, Math.min(100_000_000, Math.round(amount) || 0));
  const annualReturn = returnPct / 100;

  const results = chosen.map((s) => {
    const f = s.fund;
    const r: TrueCostResult | null =
      f.annualCostRate === null
        ? null
        : trueCost({ principal, years, annualReturn, frontEnd: f.frontEndRate ?? 0, backEnd: f.backEndRate ?? 0, annualCost: f.annualCostRate });
    return { ...s, r };
  });
  const computed = results.filter((x): x is typeof x & { r: TrueCostResult } => x.r !== null);

  const rows: ChartRow[] = Array.from({ length: years + 1 }, (_, t) => {
    const row: ChartRow = { year: t, gross: principal * (1 + annualReturn) ** t } as ChartRow;
    for (const x of computed) row[x.code] = t === years ? x.r.end : x.r.values[t];
    return row;
  });
  const series: ChartSeries[] = computed.map((x) => ({ key: x.code, name: x.fund.nameTh, slot: x.slot }));

  const feeCosts = computed.map((x) => x.r.feeCost);
  const spread = feeCosts.length >= 2 ? Math.max(...feeCosts) - Math.min(...feeCosts) : null;
  const anySample = chosen.some((s) => s.fund.isSample);

  const assumptions = [
    `ลงทุนครั้งเดียว ${principal.toLocaleString("th-TH")} บาท ถือ ${years} ปี แล้วขายทั้งหมด`,
    `สมมติผลตอบแทนก่อนหักค่าใช้จ่าย ${returnPct.toFixed(1)}% ต่อปี ทุกกองเท่ากัน เป็นสมมติฐานเพื่อเทียบค่าใช้จ่ายเท่านั้น ไม่ใช่การคาดการณ์ผลตอบแทน`,
    "ต้นทุนต่อปีรวม = ค่าใช้จ่ายรวมของกอง (TER) + ค่าใช้จ่ายของกองทุนหลัก ถ้าเอกสารระบุว่า TER ยังไม่รวม",
    "ไม่รวมภาษี ค่าธรรมเนียมการสับเปลี่ยน และค่าใช้จ่ายที่เอกสารไม่ได้ระบุเป็นตัวเลข",
    "คำนวณด้วยสูตรในระบบ ไม่ได้ให้ AI คิดตัวเลข",
    ...chosen.flatMap((s) => [
      ...(s.fund.frontEndRate === null ? [`${s.fund.nameTh}: ${NOT_FOUND} สำหรับค่าธรรมเนียมการขาย คำนวณโดยถือว่าเป็น 0`] : []),
      ...(s.fund.backEndRate === null ? [`${s.fund.nameTh}: ${NOT_FOUND} สำหรับค่าธรรมเนียมการรับซื้อคืน คำนวณโดยถือว่าเป็น 0`] : []),
      ...(s.fund.masterInclusionUnknown ? [`${s.fund.nameTh}: เอกสารไม่ระบุว่า TER รวมค่าใช้จ่ายกองทุนหลักแล้วหรือไม่ คำนวณโดยถือว่ายังไม่รวม`] : []),
    ]),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* fund picker */}
      <section aria-labelledby="pick-title" className="rounded-[24px] border border-line bg-surface p-5 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="pick-title" className="m-0 text-[20px] font-bold">
            {mode === "fees" ? "เลือกกองที่จะเทียบ" : "เลือกกองที่จะคำนวณ"}{" "}
            <span className="text-[15px] font-medium text-ink-muted">({MIN_FUNDS}–{MAX_FUNDS} กอง)</span>
          </h2>
          {anySample && <SampleBadge className="!text-[13px]" />}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {funds.map((f) => {
            const sel = selected.find((s) => s.code === f.code);
            const disabled = sel ? selected.length <= MIN_FUNDS : selected.length >= MAX_FUNDS;
            return (
              <button
                key={f.code}
                type="button"
                onClick={() => toggle(f.code)}
                aria-pressed={Boolean(sel)}
                disabled={disabled && !sel}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  sel ? "border-brand bg-brand-soft text-ink" : "border-line bg-surface text-ink-body hover:border-brand"
                }`}
              >
                {sel ? <Swatch slot={sel.slot} /> : <span className="text-ink-faint">+</span>}
                {f.nameTh}
                {f.isSample && <span className="text-[11px] font-medium text-sun-ink">(ตัวอย่าง)</span>}
              </button>
            );
          })}
        </div>
      </section>

      {mode === "money" && (
        <>
      {/* inputs */}
      <section aria-label="สมมติฐานการคำนวณ" className="grid gap-5 rounded-[24px] border border-line bg-surface p-5 md:grid-cols-3 md:p-6">
        <label className="flex flex-col gap-2">
          <span className="font-semibold">เงินลงทุน (บาท)</span>
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
            {AMOUNT_PRESETS.map((v) => (
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
          <input type="range" min={MIN_YEARS} max={MAX_YEARS} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} className="h-2 cursor-pointer accent-[#1A7637]" />
          <span className="flex justify-between text-[12px] text-ink-faint">
            <span>{MIN_YEARS}</span>
            <span>{MAX_YEARS}</span>
          </span>
        </label>
        <label className="flex flex-col gap-2">
          <span className="flex justify-between font-semibold">
            ผลตอบแทนสมมติ <b className="text-brand">{returnPct.toFixed(1)}% ต่อปี</b>
          </span>
          <input type="range" min={0} max={12} step={0.5} value={returnPct} onChange={(e) => setReturnPct(Number(e.target.value))} className="h-2 cursor-pointer accent-[#1A7637]" />
          <span className="text-[12px] text-ink-faint">สมมติฐาน ไม่ใช่การคาดการณ์ (ค่าเริ่มต้น 6%)</span>
        </label>
      </section>

      {/* results */}
      <section aria-labelledby="result-title" className="flex flex-col gap-4">
        <h2 id="result-title" className="m-0 text-[22px] font-bold">
          ค่าธรรมเนียมเป็นบาท ใน {years} ปี
        </h2>
        <div className={`grid gap-4 ${results.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {results.map((x) => (
            <article key={x.code} className="flex flex-col gap-2 rounded-[20px] border border-line bg-surface p-5">
              <div className="flex items-center gap-2 font-semibold">
                <Swatch slot={x.slot} />
                {x.fund.nameTh}
              </div>
              {x.r ? (
                <>
                  <div>
                    <div className="text-[13px] text-ink-muted">เสียค่าธรรมเนียมและค่าใช้จ่ายรวม</div>
                    <div className="font-heading text-[30px] font-bold leading-tight text-ink">{baht(x.r.feeCost)}</div>
                  </div>
                  <div className="flex justify-between gap-2 border-t border-line pt-2 text-[14px] text-ink-body">
                    <span>เหลือเงินเมื่อขาย</span>
                    <b className="text-ink">{baht(x.r.end)}</b>
                  </div>
                  <div className="flex justify-between gap-2 text-[14px] text-ink-body">
                    <span>ต้นทุนต่อปีรวม</span>
                    <b className="text-ink">{pct(x.fund.annualCostRate!)}</b>
                  </div>
                </>
              ) : (
                <p className="m-0 text-ink-body">{NOT_FOUND} (ค่าใช้จ่ายรวมของกอง) จึงคำนวณไม่ได้</p>
              )}
            </article>
          ))}
        </div>
        {spread !== null && (
          <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-[20px] bg-brand-soft px-5 py-4">
            <span className="font-semibold text-ink">
              {computed.length === 2 ? "ค่าธรรมเนียมสองกองนี้ต่างกัน" : "ส่วนต่างระหว่างกองที่เสียค่าธรรมเนียมมากที่สุดกับน้อยที่สุด"}
            </span>
            <span className="font-heading text-[30px] font-bold text-brand">{baht(spread)}</span>
          </div>
        )}
      </section>

      {/* chart */}
      {series.length > 0 && (
        <section aria-labelledby="chart-title" className="rounded-[24px] border border-line bg-surface p-4 md:p-6">
          <h2 id="chart-title" className="m-0 text-[18px] font-bold">
            เงินของคุณในแต่ละปี หลังหักค่าใช้จ่าย
          </h2>
          <ul className="m-0 mt-2 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-[14px] text-ink-body" aria-label="คำอธิบายเส้นกราฟ">
            {series.map((s) => (
              <li key={s.key} className="flex items-center gap-1.5">
                <Swatch slot={s.slot} /> {s.name}
              </li>
            ))}
            <li className="flex items-center gap-1.5 text-ink-muted">
              <span className="inline-block w-5 border-t-2 border-dashed border-ink-muted" aria-hidden="true" /> ถ้าไม่มีค่าธรรมเนียมเลย
            </li>
          </ul>
          <div className="mt-3">
            <CostChart rows={rows} series={series} />
          </div>
        </section>
      )}
        </>
      )}

      {mode === "fees" && (
        <>
      {/* fee table */}
      <section aria-labelledby="table-title" className="rounded-[24px] border border-line bg-surface">
        <h2 id="table-title" className="m-0 px-5 pt-5 text-[18px] font-bold md:px-6">
          ค่าใช้จ่ายทุกชั้น พร้อมเลขหน้าในเอกสาร
        </h2>
        <div className="overflow-x-auto p-2 md:p-3">
          <table className="w-full min-w-[560px] border-collapse text-left text-[14.5px]">
            <thead>
              <tr className="border-b border-line">
                <th className="p-3 font-semibold text-ink-muted">รายการ</th>
                {chosen.map((s) => (
                  <th key={s.code} className="p-3 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Swatch slot={s.slot} />
                      {s.fund.nameTh}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chosen[0]?.fund.layers.map((layer, i) => (
                <tr key={layer.key} className="border-b border-line-subtle">
                  <td className="p-3 text-ink-body">
                    {layer.label} <span className="text-[12px] text-ink-faint">({layer.unit})</span>
                  </td>
                  {chosen.map((s) => {
                    const item = s.fund.layers[i].item;
                    const hidden = layer.key === "masterFundExpense" && item.value !== null && item.source === "prospectus";
                    return (
                      <td key={s.code} className={`p-3 align-top ${hidden ? "bg-sun-soft" : ""}`}>
                        {item.value === null ? (
                          <span className="text-[13px] text-ink-muted">{NOT_FOUND}</span>
                        ) : (
                          <span className="flex flex-col">
                            <b className="text-ink">{item.value.toFixed(2)}%</b>
                            <PageTag page={item.page} source={item.source} />
                            {hidden && <span className="text-[12px] font-semibold text-sun-ink"><Icon name="warn" className="mr-1" />อยู่ในหนังสือชี้ชวน ไม่อยู่ใน Factsheet</span>}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-brand-tint">
                <td className="p-3 font-bold">ต้นทุนต่อปีรวม</td>
                {chosen.map((s) => (
                  <td key={s.code} className="p-3 font-bold text-ink">
                    {s.fund.annualCostRate === null ? <span className="text-[13px] font-normal text-ink-muted">คำนวณไม่ได้</span> : pct(s.fund.annualCostRate)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-[13px] text-ink-muted">ข้อมูล ณ วันที่</td>
                {chosen.map((s) => (
                  <td key={s.code} className="p-3 text-[13px] text-ink-muted">
                    {s.fund.asOfDate.value ?? NOT_FOUND}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="m-0 border-t border-line px-5 py-3 text-[13.5px] text-ink-muted md:px-6">
          ต้นทุนต่อปีรวม = ค่าใช้จ่ายรวมของกอง (TER) + ค่าใช้จ่ายของกองทุนหลัก ถ้าเอกสารระบุว่า TER ยังไม่รวม · เทียบเฉพาะค่าธรรมเนียม ไม่ได้บอกว่ากองไหนดีกว่า
        </p>
      </section>

      <Link
        href={`/calculator?funds=${encodeURIComponent(selected.map((s) => s.code).join(","))}`}
        className="flex flex-wrap items-center justify-between gap-2 rounded-[20px] bg-brand-soft px-5 py-4 font-bold text-brand no-underline hover:underline"
      >
        อยากรู้ว่าต่างกันกี่บาท? คำนวณกองที่เลือกเป็นเงินบาท →
      </Link>
        </>
      )}

      {mode === "money" && (
      /* assumptions */
      <section aria-labelledby="assume-title" className="rounded-[24px] border border-line bg-surface p-5 md:p-6">
        <h2 id="assume-title" className="m-0 text-[17px] font-bold">
          สมมติฐานที่ใช้คำนวณ
        </h2>
        <ul className="m-0 mt-2 flex flex-col gap-1 pl-5 text-[14.5px] text-ink-body">
          {assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>
      )}
    </div>
  );
}

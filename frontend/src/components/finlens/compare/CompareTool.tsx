"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";

import type { CompareFund } from "@/lib/compare";
import { FEE_PHASES } from "@/lib/feePhases";
import { NOT_FOUND, NOT_IN_DOCS } from "@/lib/disclaimer";
import { baht, docPct, pct } from "@/lib/money";
import { useTheme } from "@/lib/theme";
import { ASSET_CLASS_LABEL, DEFAULT_ANNUAL_RETURN, defaultReturnFor, feeGapBaht, MAX_YEARS, MIN_YEARS, trueCost, type TrueCostResult } from "@/lib/trueCost";
import { sourceRef } from "@/lib/sources";

import { DataStatusBadge } from "../app/DataStatusBadge";
import { SampleBadge } from "../SampleBadge";
import { Icon } from "../Icon";
import { Lensy } from "../Lensy";
import { CostChart, SERIES_COLORS, type ChartRow, type ChartSeries } from "./CostChart";
import { searchFunds } from "@/lib/fundSearch";
import { MAX_COMPARE_FUNDS } from "@/lib/limits";

const MAX_FUNDS = MAX_COMPARE_FUNDS;

/**
 * "fees": /compare — every fee layer of up to MAX_COMPARE_FUNDS funds side by side, with pages (no baht).
 * "money": /calculator — fee cost in baht for the chosen funds, with sliders, chart and assumptions.
 */
export type CompareMode = "fees" | "money";
const AMOUNT_PRESETS = [10_000, 100_000, 500_000, 1_000_000];

type Selected = { code: string; slot: number };

function Swatch({ slot }: { slot: number }) {
  const { resolved } = useTheme();
  return <i className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ background: SERIES_COLORS[resolved][slot] }} aria-hidden="true" />;
}

/**
 * The fund list stays in view (in its own scroll box, with a filter on top). Picked funds show as
 * chips with their chart colour. Before the first comparison, a button starts it.
 */
function FundPicker({
  funds,
  selected,
  min,
  started,
  startLabel,
  onToggle,
  onStart,
}: {
  funds: CompareFund[];
  selected: Selected[];
  min: number;
  started: boolean;
  startLabel: string;
  onToggle: (code: string) => void;
  onStart: () => void;
}) {
  const [query, setQuery] = useState("");
  const byCode = new Map(funds.map((f) => [f.code, f]));
  const full = selected.length >= MAX_FUNDS;
  const { list: options, total } = searchFunds(funds, query);
  const searching = query.trim().length > 0;

  return (
    <div className="mt-4 flex flex-col gap-4">
      {selected.length > 0 && (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="กองที่เลือก">
          {selected.map((s) => {
            const f = byCode.get(s.code);
            if (!f) return null;
            return (
              <li key={s.code} className="inline-flex min-h-[44px] max-w-full items-center gap-2 rounded-full border border-brand/40 bg-brand-soft py-1 pl-3.5 pr-1.5 text-[15px] font-semibold text-ink">
                <Swatch slot={s.slot} />
                <span className="min-w-0 truncate">{f.nameTh}</span>
                <button
                  type="button"
                  onClick={() => onToggle(s.code)}
                  aria-label={`เอา ${f.nameTh} ออก`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[18px] leading-none text-ink-muted hover:bg-surface hover:text-ink"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col gap-2 rounded-2xl border border-line p-2">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
            <Icon name="search" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อหรือรหัสกอง"
            aria-label="ค้นหากอง"
            className="min-h-[44px] w-full rounded-xl bg-line-subtle pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <p className="m-0 px-2 text-[12.5px] text-ink-muted">
          {searching
            ? total > options.length
              ? `พบ ${total.toLocaleString("th-TH")} กอง แสดง ${options.length} กองที่ตรงที่สุด พิมพ์เพิ่มเพื่อให้แคบลง`
              : total > 0
                ? `พบ ${total} กอง`
                : ""
            : "แนะนำ · พิมพ์ชื่อหรือรหัสเพื่อค้นหากองอื่น"}
        </p>
        <ul className="m-0 grid list-none grid-cols-1 gap-1 p-0 sm:grid-cols-2">
          {options.length === 0 && <li className="px-3 py-2.5 text-[14px] text-ink-muted">ไม่พบกองที่ตรงกับคำค้น ลองพิมพ์รหัสกอง เช่น KFUS</li>}
          {options.map((f) => {
            const sel = selected.find((s) => s.code === f.code);
            const disabled = !sel && full;
            return (
              <li key={f.code} className="min-w-0">
                <button
                  type="button"
                  onClick={() => onToggle(f.code)}
                  aria-pressed={Boolean(sel)}
                  disabled={disabled}
                  className={`flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    sel ? "bg-brand-soft" : "hover:bg-line-subtle"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-transparent" : "border-line"}`}
                  >
                    {sel && <Swatch slot={sel.slot} />}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    {/* long fund names wrap to two lines inside the box instead of running past it */}
                    <span className="line-clamp-2 break-words text-[14.5px] font-semibold leading-snug text-ink">
                      {f.nameTh} {f.isSample && <span className="text-[11px] font-medium text-sun-ink">(ตัวอย่าง)</span>}
                    </span>
                    <span className="truncate text-[12.5px] text-ink-muted">{f.code}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {!started && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onStart}
            disabled={selected.length < min}
            className="inline-flex min-h-[50px] items-center rounded-full bg-brand px-8 text-[16px] font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {startLabel}
          </button>
          {selected.length < min && <span className="text-[14px] text-ink-muted">เลือกกองที่สนใจจากรายการด้านบนก่อนนะคะ</span>}
        </div>
      )}
    </div>
  );
}

export function CompareTool({ funds, initialCodes, mode }: { funds: CompareFund[]; initialCodes: string[]; mode: CompareMode }) {
  const MIN_FUNDS = mode === "fees" ? 2 : 1;
  // Each fund keeps its color slot while selected, so removing one never repaints the others.
  const [selected, setSelected] = useState<Selected[]>(initialCodes.map((code, slot) => ({ code, slot })));
  // nothing is compared until the user presses the button (a link that names funds starts at once)
  const [started, setStarted] = useState(initialCodes.length >= MIN_FUNDS);
  const showResults = started && selected.length >= MIN_FUNDS;
  const [amount, setAmount] = useState(100_000);
  const [years, setYears] = useState(10);
  // the assumed return follows the kind of funds chosen until the user moves the slider
  const [returnPct, setReturnPct] = useState(DEFAULT_ANNUAL_RETURN * 100);
  const [returnTouched, setReturnTouched] = useState(false);

  const byCode = useMemo(() => new Map(funds.map((f) => [f.code, f])), [funds]);
  const chosen = selected.map((s) => ({ ...s, fund: byCode.get(s.code)! })).filter((s) => s.fund);

  // fee rows per phase, shared by the phone cards and the table: rows where no chosen fund has a figure say nothing
  const phaseRows = FEE_PHASES.map((ph) => ({
    ph,
    layers: (chosen[0]?.fund.layers ?? []).filter(
      (l) =>
        l.phase === ph.phase &&
        chosen.some((s) => {
          const own = s.fund.layers.find((x) => x.key === l.key);
          return own && (own.item.value !== null || own.remainder);
        }),
    ),
  })).filter((p) => p.layers.length > 0);

  /** One fund's figure for one fee row: its label, the value (source on hover), and whether Factsheet hides it. */
  function feeCell(fund: CompareFund, key: string) {
    const own = fund.layers.find((l) => l.key === key)!;
    const isMaster = key === "masterFundExpense";
    // already inside the TER: shown as a breakdown under it, never added again
    const insideTer = key === "management" || key === "otherExpenses";
    const label = insideTer ? `${own.label.replace("ค่าธรรมเนียม", "ค่า")} (อยู่ใน TER แล้ว)` : own.label;
    const item = own.item;
    const rest = own.remainder;
    const hidden = isMaster && item.value !== null && (item.source === "prospectus" || item.source === "master");
    const value = item.value !== null ? item.value : rest ? rest.value : null;
    const ref = item.value !== null ? item : rest ? rest.ter : null;
    const node =
      value === null || !ref ? (
        <span className="text-[13.5px] text-ink-faint">{own.emptyText ? "ไม่มี (ลงทุนตรง)" : NOT_IN_DOCS}</span>
      ) : (
        // the source of every figure shows on hover (title)
        <span className={insideTer ? "text-ink-muted" : "font-bold text-ink"} title={sourceRef(ref.page, ref.source)}>
          {own.sign === -1 ? "-" : ""}
          {docPct(value)}
        </span>
      );
    return { label, insideTer, hidden, node };
  }

  function toggle(code: string) {
    setSelected((cur) => {
      if (cur.some((s) => s.code === code)) return cur.filter((s) => s.code !== code);
      if (cur.length >= MAX_FUNDS) return cur;
      const used = new Set(cur.map((s) => s.slot));
      const slot = Array.from({ length: MAX_FUNDS }, (_, n) => n).find((n) => !used.has(n))!;
      return [...cur, { code, slot }];
    });
  }

  // keep the URL shareable (e.g. from LINE) without a page reload
  useEffect(() => {
    if (!started) return;
    const url = new URL(window.location.href);
    url.searchParams.set("funds", selected.map((s) => s.code).join(","));
    window.history.replaceState(null, "", url);
  }, [selected, started]);

  const principal = Math.max(0, Math.min(100_000_000, Math.round(amount) || 0));
  const classes = chosen.map((s) => s.fund.assetClass);
  const suggestedPct = defaultReturnFor(classes) * 100;
  const usedPct = returnTouched ? returnPct : suggestedPct;
  const lowDefault = suggestedPct < DEFAULT_ANNUAL_RETURN * 100;
  const defaultReason = lowDefault ? ` สำหรับ${[...new Set(classes)].map((c) => ASSET_CLASS_LABEL[c]).join("และ")}` : "";
  const annualReturn = usedPct / 100;

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
  const spread = feeGapBaht(feeCosts);
  const anySample = chosen.some((s) => s.fund.isSample);

  const assumptions = [
    `ลงทุนครั้งเดียว ${principal.toLocaleString("th-TH")} บาท ถือ ${years} ปี แล้วขายทั้งหมด`,
    `สมมติผลตอบแทนก่อนหักค่าใช้จ่าย ${usedPct.toFixed(1)}% ต่อปี ทุกกองเท่ากัน เป็นสมมติฐานเพื่อเทียบค่าใช้จ่ายเท่านั้น ไม่ใช่การคาดการณ์ผลตอบแทน`,
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
          </h2>
          {anySample && <SampleBadge className="!text-[13px]" />}
        </div>
        <FundPicker
          funds={funds}
          selected={selected}
          min={MIN_FUNDS}
          started={started}
          startLabel={mode === "fees" ? "เทียบเลย" : "คำนวณเลย"}
          onToggle={toggle}
          onStart={() => setStarted(true)}
        />
      </section>

      {showResults && (
        <>
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
            ผลตอบแทนสมมติ <b className="text-brand">{usedPct.toFixed(1)}% ต่อปี</b>
          </span>
          <input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={usedPct}
            onChange={(e) => {
              setReturnPct(Number(e.target.value));
              setReturnTouched(true);
            }}
            className="h-2 cursor-pointer accent-[#1A7637]"
          />
          <span className="flex flex-wrap items-center gap-x-2 text-[12px] text-ink-faint">
            สมมติฐาน ไม่ใช่การคาดการณ์ (ค่าเริ่มต้น {suggestedPct}%{defaultReason})
            {returnTouched && usedPct !== suggestedPct && (
              <button type="button" onClick={() => setReturnTouched(false)} className="font-semibold text-brand underline-offset-2 hover:underline">
                ใช้ค่าเริ่มต้น
              </button>
            )}
          </span>
        </label>
      </section>

      {/* results */}
      <section aria-labelledby="result-title" className="flex flex-col gap-4">
        <h2 id="result-title" className="m-0 text-[22px] font-bold">
          ค่าธรรมเนียมเป็นบาท ใน {years} ปี
        </h2>
        <div className={`grid gap-4 ${results.length === 4 ? "md:grid-cols-2 xl:grid-cols-4" : results.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
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
      {/* fee table: phones get one card per fund stacked down the page (the same for 2, 3 or 4 funds);
          sm and up get the side-by-side table */}
      <section aria-labelledby="table-title" className="rounded-[24px] border border-line bg-surface">
        <div className="flex flex-col gap-1 px-5 pt-5 md:px-6">
          <h2 id="table-title" className="m-0 text-[18px] font-bold">
            Fee X-Ray: ค่าใช้จ่ายทุกชั้น แยกตามช่วงที่จ่าย
          </h2>
          <p className="m-0 text-[13.5px] text-ink-muted">ชี้ที่ตัวเลขเพื่อดูว่ามาจากเอกสารหน้าไหน · ช่องสีเหลืองคือค่าใช้จ่ายที่ Factsheet ไม่ได้แสดง</p>
        </div>

        <ul className="m-0 flex list-none flex-col gap-3 p-3 sm:hidden">
          {chosen.map((s) => (
            <li key={s.code} className="overflow-hidden rounded-2xl border border-line">
              <div className="flex flex-col gap-1 bg-brand-dark px-4 py-3 text-white">
                <span className="flex items-center gap-1.5 text-[16px] font-bold">
                  <span className="flex rounded-full ring-2 ring-white">
                    <Swatch slot={s.slot} />
                  </span>
                  {s.code}
                </span>
                <span className="text-[13px] leading-snug text-white/80">{s.fund.nameTh}</span>
                {s.fund.status.kind !== "verified" && <DataStatusBadge status={s.fund.status} chipOnly />}
              </div>
              <div className="flex items-center justify-between gap-3 border-b-2 border-brand/20 bg-brand-soft px-4 py-3">
                <span className="text-[15px] font-bold text-ink">ต้นทุนต่อปีรวม</span>
                {s.fund.annualCostRate === null ? (
                  <span className="text-[13px] text-ink-muted">คำนวณไม่ได้</span>
                ) : (
                  <b className="text-[22px] leading-none text-brand">{pct(s.fund.annualCostRate)}</b>
                )}
              </div>
              {phaseRows.map(({ ph, layers }) => (
                <Fragment key={ph.phase}>
                  <div className="bg-brand px-4 py-1.5 text-[13.5px] font-bold text-white">
                    {ph.title} <span className="font-normal text-white/80">· {ph.phase === "hold" ? "ต่อปี" : "ต่อครั้ง"}</span>
                  </div>
                  {layers.map((layer) => {
                    const c = feeCell(s.fund, layer.key);
                    return (
                      <div
                        key={layer.key}
                        className={`flex items-start justify-between gap-3 border-b border-line-subtle py-2.5 pr-4 last:border-0 ${c.insideTer ? "pl-8" : "pl-4"} ${c.hidden ? "bg-sun-soft" : ""}`}
                      >
                        <span className={`text-[14px] ${c.insideTer ? "text-ink-muted" : "text-ink"}`}>{c.label}</span>
                        <span className="shrink-0 text-right text-[15px]">{c.node}</span>
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto px-3 pb-3 sm:block md:px-4">
          <table className="w-full min-w-[620px] table-fixed border-collapse overflow-hidden rounded-2xl text-left text-[15px]">
            <colgroup>
              <col className="w-[30%]" />
              {chosen.map((s) => (
                <col key={s.code} />
              ))}
            </colgroup>
            <thead>
              <tr className="bg-brand-dark text-white">
                <th className="p-3" aria-label="รายการ" />
                {chosen.map((s) => (
                  <th key={s.code} className="p-3 align-top font-normal">
                    <span className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-[16px] font-bold">
                        <span className="flex rounded-full ring-2 ring-white">
                          <Swatch slot={s.slot} />
                        </span>
                        {s.code}
                      </span>
                      <span className="line-clamp-2 text-[12.5px] leading-snug text-white/75">{s.fund.nameTh}</span>
                      {/* only a warning shows here (sample / incomplete data); checked funds need no badge */}
                      {s.fund.status.kind !== "verified" && <DataStatusBadge status={s.fund.status} chipOnly />}
                    </span>
                  </th>
                ))}
              </tr>
              {/* the number that matters, first */}
              <tr className="border-b-2 border-brand/20 bg-brand-soft">
                <th scope="row" className="p-3 text-left font-bold text-ink">
                  ต้นทุนต่อปีรวม
                </th>
                {chosen.map((s) => (
                  <td key={s.code} className="p-3">
                    {s.fund.annualCostRate === null ? (
                      <span className="text-[13px] text-ink-muted">คำนวณไม่ได้</span>
                    ) : (
                      <b className="text-[22px] leading-none text-brand">{pct(s.fund.annualCostRate)}</b>
                    )}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {phaseRows.map(({ ph, layers }) => (
                <Fragment key={ph.phase}>
                  <tr className="bg-brand text-white">
                    <td colSpan={chosen.length + 1} className="px-3 py-2 text-[14px] font-bold">
                      {ph.title} <span className="font-normal text-white/80">· {ph.phase === "hold" ? "ต่อปี" : "ต่อครั้ง"}</span>
                    </td>
                  </tr>
                  {layers.map((layer) => {
                    const head = feeCell(chosen[0].fund, layer.key);
                    return (
                      <tr key={layer.key} className="border-b border-line-subtle">
                        <td className={`p-3 align-top ${head.insideTer ? "pl-8 text-[14px] text-ink-muted" : "text-ink"}`}>{head.label}</td>
                        {chosen.map((s) => {
                          const c = feeCell(s.fund, layer.key);
                          return (
                            <td key={s.code} className={`p-3 align-top ${c.hidden ? "bg-sun-soft" : ""}`}>
                              {c.node}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <p className="m-0 border-t border-line px-5 py-3 text-[13.5px] text-ink-muted md:px-6">
          ต้นทุนต่อปีรวม = ค่าใช้จ่ายรวมของกอง (TER) + ค่าใช้จ่ายของกองทุนหลัก ถ้าเอกสารระบุว่า TER ยังไม่รวม · เทียบเฉพาะค่าธรรมเนียม ไม่ได้บอกว่ากองไหนดีกว่า
        </p>
      </section>

      {/* next step: the same funds, in baht */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-brand/15 bg-gradient-to-r from-brand-soft to-brand-tint py-4 pl-4 pr-5 md:pl-5 md:pr-6">
        <div className="flex items-center gap-4">
          <Lensy pose="coins" size={72} className="shrink-0 max-sm:!h-[56px] max-sm:!w-[56px]" />
          <div className="flex flex-col gap-0.5">
            <b className="text-[18px] text-ink">อยากรู้ว่าต่างกันกี่บาท?</b>
            <span className="text-[14px] text-ink-muted">ใช้กองที่เลือกไว้ ปรับเงินลงทุนและจำนวนปีได้เอง</span>
          </div>
        </div>
        <Link
          href={`/calculator?funds=${encodeURIComponent(selected.map((s) => s.code).join(","))}`}
          className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-brand-dark px-6 font-bold text-white no-underline hover:bg-brand max-sm:w-full max-sm:justify-center"
        >
          คำนวณเป็นเงินบาท
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </section>
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
        </>
      )}
    </div>
  );
}

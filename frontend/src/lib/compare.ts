/**
 * What the compare page needs from a verified fund, in a plain serializable shape for the client.
 * No calculation of money here: the client calls lib/trueCost.ts with these rates.
 */
import { fundDataStatus, type DataStatus } from "./dataStatus";
import { NO_MASTER_NOTE, REBATE_LABEL } from "./disclaimer";
import type { FeePhase } from "./feePhases";
import { totalAnnualCostRate } from "./funds";
import { pctToRate, type Fund, type Sourced } from "./schema";
import { assetClassOf, type AssetClass } from "./trueCost";
import { MAX_COMPARE_FUNDS } from "./limits";

export type FeeLayerKey = "frontEnd" | "backEnd" | "switching" | "management" | "ter" | "masterFundExpense" | "otherExpenses" | "rebate";

export type FeeLayer = {
  key: FeeLayerKey;
  label: string;
  unit: "ต่อครั้ง" | "ต่อปี";
  phase: FeePhase;
  /** shown under the label, e.g. that it is already inside the TER (so it is not added twice) */
  note?: string;
  /** -1: money back (the rebate), shown with a minus sign and subtracted from the total */
  sign?: -1;
  /** shown instead of "ไม่พบในเอกสาร" when the value is empty for a known reason (a direct fund has no master fund) */
  emptyText?: string;
  /** % as written in the document */
  item: Sourced<number>;
  /**
   * Only on "otherExpenses" when the documents give no figure for it: the rest of the TER after the
   * management fee (TER − management), computed here and cited with both pages. It is inside the
   * TER, so it is never added to the total.
   */
  remainder?: TerRemainder;
};

export type TerRemainder = { value: number; ter: Sourced<number>; management: Sourced<number> };

/** TER − management fee, in % (4 decimals), when both are in the documents and the TER is the larger. */
export function terRemainder(f: Fund): TerRemainder | undefined {
  const { ter, management } = f.fees;
  if (ter.value === null || management.value === null || ter.page === null || management.page === null) return undefined;
  const value = Math.round((ter.value - management.value) * 10_000) / 10_000;
  return value > 0 ? { value, ter, management } : undefined;
}

export type CompareFund = {
  code: string;
  nameTh: string;
  isSample: boolean;
  /** money market / fixed income / other: picks the default assumed return */
  assetClass: AssetClass;
  asOfDate: Sourced<string>;
  layers: FeeLayer[];
  /** TER + master fund expense as a rate; null = TER not in the documents, cannot calculate */
  annualCostRate: number | null;
  /** The master fund expense was added because the documents don't say whether the TER includes it */
  masterInclusionUnknown: boolean;
  /** rates; null = not in the documents */
  frontEndRate: number | null;
  backEndRate: number | null;
  status: DataStatus;
};

/* Order = how the table reads: buy, hold, sell, switch. Management fee and other expenses are part
 * of the TER, so they are shown but not added again (the total is TER + master fund expense). */
const LAYERS: { key: FeeLayerKey; label: string; unit: FeeLayer["unit"]; phase: FeePhase; note?: string; sign?: -1 }[] = [
  { key: "frontEnd", label: "ค่าธรรมเนียมการขาย", unit: "ต่อครั้ง", phase: "buy" },
  { key: "ter", label: "ค่าใช้จ่ายรวมของกองนี้ (TER)", unit: "ต่อปี", phase: "hold" },
  { key: "management", label: "ค่าธรรมเนียมการจัดการ", unit: "ต่อปี", phase: "hold", note: "รวมอยู่ใน TER แล้ว ไม่นับซ้ำ" },
  { key: "otherExpenses", label: "ค่าใช้จ่ายอื่นของกอง", unit: "ต่อปี", phase: "hold", note: "รวมอยู่ใน TER แล้ว ไม่นับซ้ำ" },
  { key: "masterFundExpense", label: "ค่าใช้จ่ายของกองทุนหลัก", unit: "ต่อปี", phase: "hold", note: "หักในกองทุนหลักอีกชั้น นับเพิ่มจาก TER" },
  { key: "rebate", label: REBATE_LABEL, unit: "ต่อปี", phase: "hold", note: "กองไทยได้เงินคืนจากกองหลัก หักออกจากต้นทุนรวม", sign: -1 },
  { key: "backEnd", label: "ค่าธรรมเนียมการรับซื้อคืน", unit: "ต่อครั้ง", phase: "sell" },
  { key: "switching", label: "ค่าธรรมเนียมการสับเปลี่ยน", unit: "ต่อครั้ง", phase: "switch" },
];

export function toCompareFund(f: Fund): CompareFund {
  const rate = (s: Sourced<number>) => (s.value === null ? null : pctToRate(s.value));
  return {
    code: f.code,
    nameTh: f.nameTh.value ?? f.code,
    isSample: f.meta.isSample,
    assetClass: assetClassOf(f.type.value),
    asOfDate: f.asOfDate,
    layers: LAYERS.map((l) => {
      const item = f.fees[l.key];
      if ((l.key === "masterFundExpense" || l.key === "rebate") && f.isFeeder.value === false && item.value === null) return { ...l, item, emptyText: NO_MASTER_NOTE };
      const remainder = l.key === "otherExpenses" && item.value === null ? terRemainder(f) : undefined;
      return remainder ? { ...l, item, remainder } : { ...l, item };
    }),
    annualCostRate: totalAnnualCostRate(f),
    masterInclusionUnknown: f.fees.masterFundExpense.value !== null && f.fees.terIncludesMasterFund.value === null,
    frontEndRate: rate(f.fees.frontEnd),
    backEndRate: rate(f.fees.backEnd),
    status: fundDataStatus(f),
  };
}

/**
 * Initial selection from ?funds=A,B: known codes only, up to 3 of them (at least `min`), else the
 * first `fallback` funds of the list (the featured real funds come first).
 */
export function pickInitialCodes(all: CompareFund[], param: string | undefined, min = 2, fallback = 2): string[] {
  const known = new Map(all.map((f) => [f.code.toUpperCase(), f.code]));
  const asked = (param ?? "")
    .split(",")
    .map((c) => known.get(c.trim().toUpperCase()))
    .filter((c): c is string => Boolean(c));
  const unique = [...new Set(asked)].slice(0, MAX_COMPARE_FUNDS);
  if (unique.length >= min) return unique;
  if (unique.length === 0) return all.slice(0, Math.min(Math.max(min, fallback), all.length)).map((f) => f.code);
  const rest = all.map((f) => f.code).filter((c) => !unique.includes(c));
  return [...unique, ...rest].slice(0, Math.min(Math.max(min, unique.length), all.length));
}

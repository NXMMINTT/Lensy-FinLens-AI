/**
 * What the compare page needs from a verified fund, in a plain serializable shape for the client.
 * No calculation of money here: the client calls lib/trueCost.ts with these rates.
 */
import { totalAnnualCostRate } from "./funds";
import { pctToRate, type Fund, type Sourced } from "./schema";

export type FeeLayerKey = "frontEnd" | "backEnd" | "switching" | "management" | "ter" | "masterFundExpense" | "otherExpenses";

export type FeeLayer = {
  key: FeeLayerKey;
  label: string;
  unit: "ต่อครั้ง" | "ต่อปี";
  /** % as written in the document */
  item: Sourced<number>;
};

export type CompareFund = {
  code: string;
  nameTh: string;
  isSample: boolean;
  asOfDate: Sourced<string>;
  layers: FeeLayer[];
  /** TER + master fund expense as a rate; null = TER not in the documents, cannot calculate */
  annualCostRate: number | null;
  /** The master fund expense was added because the documents don't say whether the TER includes it */
  masterInclusionUnknown: boolean;
  /** rates; null = not in the documents */
  frontEndRate: number | null;
  backEndRate: number | null;
};

const LAYERS: { key: FeeLayerKey; label: string; unit: FeeLayer["unit"] }[] = [
  { key: "frontEnd", label: "ค่าธรรมเนียมการขาย (ตอนซื้อ)", unit: "ต่อครั้ง" },
  { key: "backEnd", label: "ค่าธรรมเนียมการรับซื้อคืน (ตอนขาย)", unit: "ต่อครั้ง" },
  { key: "switching", label: "ค่าธรรมเนียมการสับเปลี่ยน", unit: "ต่อครั้ง" },
  { key: "management", label: "ค่าธรรมเนียมการจัดการ", unit: "ต่อปี" },
  { key: "ter", label: "ค่าใช้จ่ายรวมของกองนี้ (TER)", unit: "ต่อปี" },
  { key: "masterFundExpense", label: "ค่าใช้จ่ายของกองทุนหลัก", unit: "ต่อปี" },
  { key: "otherExpenses", label: "ค่าใช้จ่ายอื่น", unit: "ต่อปี" },
];

export function toCompareFund(f: Fund): CompareFund {
  const rate = (s: Sourced<number>) => (s.value === null ? null : pctToRate(s.value));
  return {
    code: f.code,
    nameTh: f.nameTh.value ?? f.code,
    isSample: f.meta.isSample,
    asOfDate: f.asOfDate,
    layers: LAYERS.map((l) => ({ ...l, item: f.fees[l.key] })),
    annualCostRate: totalAnnualCostRate(f),
    masterInclusionUnknown: f.fees.masterFundExpense.value !== null && f.fees.terIncludesMasterFund.value === null,
    frontEndRate: rate(f.fees.frontEnd),
    backEndRate: rate(f.fees.backEnd),
  };
}

/** Initial selection from ?funds=A,B: known codes only, 2–3 of them, else the first two funds. */
export function pickInitialCodes(all: CompareFund[], param: string | undefined, min = 2): string[] {
  const known = new Map(all.map((f) => [f.code.toUpperCase(), f.code]));
  const asked = (param ?? "")
    .split(",")
    .map((c) => known.get(c.trim().toUpperCase()))
    .filter((c): c is string => Boolean(c));
  const unique = [...new Set(asked)].slice(0, 3);
  if (unique.length >= min) return unique;
  const rest = all.map((f) => f.code).filter((c) => !unique.includes(c));
  return [...unique, ...rest].slice(0, Math.min(Math.max(min, unique.length), all.length));
}

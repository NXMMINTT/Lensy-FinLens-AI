/**
 * Sample (made-up) funds for the landing page ("ข้อมูลตัวอย่าง"). The numbers come from
 * data/verified/SAMPLE-*.json (meta.isSample = true), the same files the fund pages read, so there is
 * one source. Values here are converted to rates (1.07% -> 0.0107) for the calculator.
 */
import sampleGlobal from "../../data/verified/SAMPLE-GLOBAL.json";
import sampleIndex from "../../data/verified/SAMPLE-INDEX.json";
import { FundSchema, pctToRate, type DocSource, type Fund, type Sourced } from "@/lib/schema";
import { trueCost } from "@/lib/trueCost";

export type { DocSource };
export type SampleSourced<T> = { value: T; page: number; source: DocSource };

export type SampleFund = {
  code: string;
  nameTh: string;
  isFeeder: boolean;
  /** rates (0.0107 = 1.07%) */
  ter: SampleSourced<number>;
  masterFundExpense: SampleSourced<number> | null;
  frontEnd: SampleSourced<number>;
  backEnd: SampleSourced<number>;
};

function need<T>(s: Sourced<T>, what: string): SampleSourced<T> {
  if (s.value === null || s.page === null) throw new Error(`sample fund is missing ${what}`);
  return { value: s.value, page: s.page, source: s.source };
}

function rate(s: Sourced<number>, what: string): SampleSourced<number> {
  const v = need(s, what);
  return { ...v, value: pctToRate(v.value) };
}

function toSample(f: Fund): SampleFund {
  return {
    code: f.code,
    nameTh: need(f.nameTh, "nameTh").value,
    isFeeder: f.isFeeder.value === true,
    ter: rate(f.fees.ter, "ter"),
    masterFundExpense: f.fees.masterFundExpense.value === null ? null : rate(f.fees.masterFundExpense, "masterFundExpense"),
    frontEnd: rate(f.fees.frontEnd, "frontEnd"),
    backEnd: rate(f.fees.backEnd, "backEnd"),
  };
}

export const SAMPLE_GLOBAL_FUND: Fund = FundSchema.parse(sampleGlobal);
export const SAMPLE_INDEX_FUND: Fund = FundSchema.parse(sampleIndex);
export const SAMPLE_ACTIVE: SampleFund = toSample(SAMPLE_GLOBAL_FUND);
export const SAMPLE_INDEX: SampleFund = toSample(SAMPLE_INDEX_FUND);

/** TER + master fund expense (the sample TERs exclude the master fund's costs). */
export function sampleAnnualCost(f: SampleFund): number {
  return f.ter.value + (f.masterFundExpense?.value ?? 0);
}

/** Assumptions shown next to every calculated figure. */
export const SAMPLE_CALC = { principal: 100_000, years: 10, annualReturn: 0.06 } as const;

export function sampleTrueCost(f: SampleFund) {
  return trueCost({
    ...SAMPLE_CALC,
    frontEnd: f.frontEnd.value,
    backEnd: f.backEnd.value,
    annualCost: sampleAnnualCost(f),
  });
}

export const SOURCE_LABEL: Record<DocSource, string> = {
  factsheet: "Factsheet",
  prospectus: "หนังสือชี้ชวน",
};

export { baht, pct } from "@/lib/money";

export type RiskLevelTag = "high" | "medium" | "info";
export type SampleRisk = { level: RiskLevelTag; topic: string; detail: string; page: number; source: DocSource };

/**
 * Sample risk alerts for the landing page, built from SAMPLE-GLOBAL. The level labels are chosen here
 * for the demo; real alerts come from lib/riskRules.ts (step 3).
 */
const g = SAMPLE_GLOBAL_FUND;
const fx = need(g.risk.fxHedging, "fxHedging");
const top10 = need(g.risk.top10Pct, "top10Pct");
const country = need(g.risk.topCountry, "topCountry");
const settle = need(g.redemption.settlementDays, "settlementDays");
export const SAMPLE_RISKS: SampleRisk[] = [
  { level: "high", topic: "ค่าเงิน", detail: "ป้องกันความเสี่ยงค่าเงินตามดุลยพินิจผู้จัดการกองทุน", page: fx.page, source: fx.source },
  { level: "medium", topic: "กระจุกตัว", detail: `10 หลักทรัพย์แรกรวมกัน ${top10.value}%`, page: top10.page, source: top10.source },
  { level: "medium", topic: "ตลาดต่างประเทศ", detail: `ลงทุนใน${country.value.name} ${country.value.pct}%`, page: country.page, source: country.source },
  { level: "info", topic: "ขายคืน", detail: `ได้รับเงินภายใน ${settle.value} วันทำการ (T+${settle.value})`, page: settle.page, source: settle.source },
];

export const RISK_TAG: Record<RiskLevelTag, { label: string; className: string }> = {
  high: { label: "สูง", className: "bg-danger-soft text-danger-ink border-danger-line" },
  medium: { label: "ปานกลาง", className: "bg-sun-soft text-sun-ink border-sun/60" },
  info: { label: "ควรรู้", className: "bg-sky text-ink-body border-sky-line" },
};

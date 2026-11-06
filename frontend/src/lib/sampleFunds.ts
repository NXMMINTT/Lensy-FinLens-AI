/**
 * Sample (made-up) funds for the landing page ("ข้อมูลตัวอย่าง"). The numbers come from
 * data/verified/SAMPLE-*.json (meta.isSample = true), the same files the fund pages read, so there is
 * one source. Values here are converted to rates (1.07% -> 0.0107) for the calculator.
 */
import sampleGlobal from "../../data/verified/SAMPLE-GLOBAL.json";
import sampleIndex from "../../data/verified/SAMPLE-INDEX.json";
import { FundSchema, pctToRate, type DocSource, type Fund, type Sourced } from "@/lib/schema";
import { RISK_LEVEL_LABEL, RISK_TOPIC_LABEL, riskAlerts, type RiskLevel } from "@/lib/riskRules";
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

export { SOURCE_LABEL } from "@/lib/sources";

export { baht, pct } from "@/lib/money";

export type RiskLevelTag = RiskLevel;
export type SampleRisk = { level: RiskLevelTag; topic: string; detail: string; page: number; source: DocSource };

/**
 * Risk alerts for the landing page: the same rules (lib/riskRules.ts) on the same fund data the app
 * shows, so a level or number on the home page can never differ from /explain or the fund page.
 */
export const SAMPLE_RISKS: SampleRisk[] = riskAlerts(SAMPLE_GLOBAL_FUND).map((a) => ({
  level: a.level,
  topic: RISK_TOPIC_LABEL[a.topic],
  detail: a.title,
  page: a.refs[0].page,
  source: a.refs[0].source,
}));

const RISK_TAG_CLASS: Record<RiskLevelTag, string> = {
  high: "bg-danger-soft text-danger-ink border-danger-line",
  medium: "bg-sun-soft text-sun-ink border-sun/60",
  info: "bg-sky text-ink-body border-sky-line",
};
export const RISK_TAG: Record<RiskLevelTag, { label: string; className: string }> = {
  high: { label: RISK_LEVEL_LABEL.high, className: RISK_TAG_CLASS.high },
  medium: { label: RISK_LEVEL_LABEL.medium, className: RISK_TAG_CLASS.medium },
  info: { label: RISK_LEVEL_LABEL.info, className: RISK_TAG_CLASS.info },
};

/**
 * The two real funds the home page uses as its example (B-INNOTECH vs K-US500X-A(A)), read from the
 * same data and through the same functions as the app: totalAnnualCostRate (lib/funds.ts),
 * trueCost (lib/trueCost.ts) and riskAlerts (lib/riskRules.ts). Nothing here is typed in by hand.
 * Server-side only (reads the fund files).
 */
import { getFund, totalAnnualCostRate } from "./funds";
import { RISK_LEVEL_LABEL, RISK_TOPIC_LABEL, riskAlerts, type RiskLevel } from "./riskRules";
import { pctToRate, type DocSource, type Fund, type Sourced } from "./schema";
import { DEFAULT_ANNUAL_RETURN, feeGapBaht, trueCost, type TrueCostResult } from "./trueCost";

export const HOME_FUND_CODES = ["B-INNOTECH", "K-US500X-A(A)"] as const;

/** A figure with where it came from; page is null when the source gives none. */
export type HomeSourced = { value: number; page: number | null; source: DocSource };

export type HomeFund = {
  code: string;
  nameTh: string;
  /** "กอง A" / "กอง B" */
  short: string;
  asOfDate: string | null;
  /** fees as % written in the documents (1.232 = 1.232%) */
  ter: HomeSourced;
  masterFundExpense: HomeSourced | null;
  frontEnd: HomeSourced | null;
  backEnd: HomeSourced | null;
  /** yearly cost the app uses (TER + master fund expense when not included), as a rate */
  annualCostRate: number;
  /** the documents don't say whether the TER already includes the master fund's cost */
  masterInclusionUnknown: boolean;
  /** the fund's own record, for the app's rules */
  fund: Fund;
};

function figure(s: Sourced<number>): HomeSourced | null {
  return s.value === null ? null : { value: s.value, page: s.page, source: s.source };
}

function toHomeFund(f: Fund, short: string): HomeFund {
  const ter = figure(f.fees.ter);
  const annual = totalAnnualCostRate(f);
  if (!ter || annual === null) throw new Error(`home page fund ${f.code} has no TER`);
  return {
    code: f.code,
    nameTh: f.nameTh.value ?? f.code,
    short,
    asOfDate: f.asOfDate.value,
    ter,
    masterFundExpense: figure(f.fees.masterFundExpense),
    frontEnd: figure(f.fees.frontEnd),
    backEnd: figure(f.fees.backEnd),
    annualCostRate: annual,
    masterInclusionUnknown: f.fees.masterFundExpense.value !== null && f.fees.terIncludesMasterFund.value === null,
    fund: f,
  };
}

/** The two example funds, A then B. Missing data stops the build instead of showing a wrong page. */
export function homeFunds(): [HomeFund, HomeFund] {
  const [a, b] = HOME_FUND_CODES.map((code) => {
    const f = getFund(code);
    if (!f) throw new Error(`home page fund ${code} is not in the data (run npm run import-funds)`);
    return f;
  });
  return [toHomeFund(a, "กอง A"), toHomeFund(b, "กอง B")];
}

/** Assumptions shown next to every calculated figure (same defaults as the calculator). */
export const HOME_CALC = { principal: 100_000, years: 10, annualReturn: DEFAULT_ANNUAL_RETURN } as const;

/** Exactly what the calculator computes for this fund (missing one-off fees count as 0, as there). */
export function homeTrueCost(f: HomeFund): TrueCostResult {
  return trueCost({
    ...HOME_CALC,
    frontEnd: f.frontEnd ? pctToRate(f.frontEnd.value) : 0,
    backEnd: f.backEnd ? pctToRate(f.backEnd.value) : 0,
    annualCost: f.annualCostRate,
  });
}

/** The one baht difference the page shows, from the same function as the compare page (feeGapBaht). */
export function homeFeeDifference(a: HomeFund, b: HomeFund): number {
  return feeGapBaht([homeTrueCost(a).feeCost, homeTrueCost(b).feeCost])!;
}

export type HomeRisk = { level: RiskLevel; topic: string; detail: string; page: number; source: DocSource };

/** Risk alerts for a fund: the app's own rules on its own data. */
export function homeRisks(f: HomeFund): HomeRisk[] {
  return riskAlerts(f.fund).map((a) => ({ level: a.level, topic: RISK_TOPIC_LABEL[a.topic], detail: a.title, page: a.refs[0].page, source: a.refs[0].source }));
}

export const RISK_TAG: Record<RiskLevel, { label: string; className: string }> = {
  high: { label: RISK_LEVEL_LABEL.high, className: "bg-danger-soft text-danger-ink border-danger-line" },
  medium: { label: RISK_LEVEL_LABEL.medium, className: "bg-sun-soft text-sun-ink border-sun/60" },
  info: { label: RISK_LEVEL_LABEL.info, className: "bg-sky text-ink-body border-sky-line" },
};

export { MASTER_COST_NOTE } from "./disclaimer";

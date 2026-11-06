/** Card data for the fund list (plain and serializable for the client search). */
import { fundDataStatus, type DataStatus } from "./dataStatus";
import { totalAnnualCostRate } from "./funds";
import { riskAlerts, type RiskLevel } from "./riskRules";
import type { DocSource, Fund } from "./schema";

export type PageRefLite = { page: number; source: DocSource; quote: string | null };

export type FundSummary = {
  code: string;
  nameTh: string;
  amc: string | null;
  type: string | null;
  isFeeder: boolean;
  isSample: boolean;
  asOfDate: string | null;
  /** ref is null when the figure has no page yet (imported SEC data): show `source` instead */
  riskLevel: { value: number; ref: PageRefLite | null; source: DocSource } | null;
  annualCostRate: number | null;
  costRefs: PageRefLite[];
  /** sources of cost figures that have no page yet */
  costSourcesWithoutPage: DocSource[];
  status: DataStatus;
  /** master fund expense is only in the prospectus */
  hiddenInProspectus: boolean;
  alertCounts: Record<RiskLevel, number>;
  topAlert: string | null;
};

function lite(s: { value: unknown; page: number | null; source: DocSource; quote: string | null }): PageRefLite[] {
  return s.value !== null && s.page !== null ? [{ page: s.page, source: s.source, quote: s.quote }] : [];
}

export function toFundSummary(f: Fund): FundSummary {
  const alerts = riskAlerts(f);
  const counts: Record<RiskLevel, number> = { high: 0, medium: 0, info: 0 };
  for (const a of alerts) counts[a.level]++;
  const rl = f.riskLevel;
  return {
    code: f.code,
    nameTh: f.nameTh.value ?? f.code,
    amc: f.amc.value,
    type: f.type.value,
    isFeeder: f.isFeeder.value === true,
    isSample: f.meta.isSample,
    asOfDate: f.asOfDate.value,
    riskLevel: rl.value !== null ? { value: rl.value, ref: rl.page !== null ? { page: rl.page, source: rl.source, quote: rl.quote } : null, source: rl.source } : null,
    annualCostRate: totalAnnualCostRate(f),
    costRefs: [...lite(f.fees.ter), ...lite(f.fees.masterFundExpense)],
    costSourcesWithoutPage: [...new Set([f.fees.ter, f.fees.masterFundExpense].filter((s) => s.value !== null && s.page === null).map((s) => s.source))],
    status: fundDataStatus(f),
    hiddenInProspectus: f.fees.masterFundExpense.value !== null && f.fees.masterFundExpense.source === "prospectus",
    alertCounts: counts,
    topAlert: alerts[0]?.title ?? null,
  };
}

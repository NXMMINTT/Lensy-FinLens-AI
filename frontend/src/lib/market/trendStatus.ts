export type TrendStatus = "hot" | "rising" | "stable" | "slowing";

/** Search-growth bands from NIGHT's trend page: >=80% hot, 30-79% rising, 0-29% stable, < 0 slowing. */
export function trendStatus(growthPct: number): TrendStatus {
  return growthPct >= 80 ? "hot" : growthPct >= 30 ? "rising" : growthPct >= 0 ? "stable" : "slowing";
}

export const TREND_STATUS_TONE = { hot: "warning", rising: "info", stable: "neutral", slowing: "neutral" } as const;

export function formatGrowth(pct: number): string {
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

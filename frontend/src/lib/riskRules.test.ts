import { describe, expect, it } from "vitest";

import { getFund } from "./funds";
import { riskAlerts } from "./riskRules";
import type { Fund } from "./schema";

const base = getFund("SAMPLE-GLOBAL")!;
const S = <T,>(value: T, page = 3) => ({ value, page, quote: `ข้อความหน้า ${page}`, source: "factsheet" as const });
const NONE = { value: null, page: null, quote: null, source: "factsheet" as const };

function withRisk(patch: Partial<Fund["risk"]>, redemption: Partial<Fund["redemption"]> = {}, extra: Partial<Fund> = {}): Fund {
  return { ...base, ...extra, risk: { ...base.risk, ...patch }, redemption: { ...base.redemption, ...redemption } };
}

const ids = (f: Fund) => riskAlerts(f).map((a) => a.id);

describe("riskAlerts", () => {
  it("covers currency, foreign market, concentration and redemption for the sample fund, each with a page", () => {
    const alerts = riskAlerts(base);
    expect(new Set(alerts.map((a) => a.topic))).toEqual(new Set(["currency", "foreign", "concentration", "redemption", "riskLevel"]));
    for (const a of alerts) {
      expect(a.refs.length).toBeGreaterThan(0);
      for (const r of a.refs) expect(r.page).toBeGreaterThan(0);
    }
  });

  it("rates currency by hedging policy", () => {
    expect(riskAlerts(withRisk({ fxHedging: S("none" as const, 1) })).find((a) => a.topic === "currency")?.level).toBe("high");
    expect(riskAlerts(withRisk({ fxHedging: S("discretionary" as const, 1) })).find((a) => a.topic === "currency")?.level).toBe("medium");
    expect(riskAlerts(withRisk({ fxHedging: S("full" as const, 1) })).find((a) => a.topic === "currency")?.level).toBe("info");
  });

  it("rates concentration by the top-10 share", () => {
    expect(riskAlerts(withRisk({ top10Pct: S(75) })).find((a) => a.id === "conc-top10")?.level).toBe("high");
    expect(riskAlerts(withRisk({ top10Pct: S(55) })).find((a) => a.id === "conc-top10")?.level).toBe("medium");
    expect(ids(withRisk({ top10Pct: S(30) }))).not.toContain("conc-top10");
  });

  it("flags slow redemption and lock-ups", () => {
    expect(riskAlerts(withRisk({}, { settlementDays: S(5, 9) })).find((a) => a.id === "redeem-days")?.level).toBe("medium");
    expect(riskAlerts(withRisk({}, { settlementDays: S(3, 9) })).find((a) => a.id === "redeem-days")?.level).toBe("info");
    expect(ids(withRisk({}, { settlementDays: S(2, 9) }))).not.toContain("redeem-days");
    expect(ids(withRisk({}, { lockUp: S("ห้ามขายคืนภายใน 1 ปี", 10) }))).toContain("redeem-lockup");
  });

  it("never shows an alert without a page (missing data -> no alert, no guess)", () => {
    const empty = withRisk({ fxHedging: NONE, topCountry: NONE, top10Pct: NONE, top5Pct: NONE, topSector: NONE }, { settlementDays: NONE, lockUp: NONE }, { isFeeder: NONE, riskLevel: NONE });
    expect(riskAlerts(empty)).toEqual([]);
  });

  it("lists high first and never uses judging words", () => {
    const alerts = riskAlerts(withRisk({ fxHedging: S("none" as const, 1), top10Pct: S(75) }));
    expect(alerts[0].level).toBe("high");
    const text = alerts.map((a) => a.title + a.detail).join(" ");
    expect(text).not.toMatch(/ดีกว่า|แย่|ไม่ดี|น่าลงทุน|ควรซื้อ|ควรขาย|แนะนำ/);
  });
});

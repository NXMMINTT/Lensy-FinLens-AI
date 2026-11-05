import { describe, expect, it } from "vitest";

import { getFund } from "./funds";
import { RISK_LEVEL_LABEL, RISK_TOPIC_LABEL, riskAlerts } from "./riskRules";
import { RISK_TAG, SAMPLE_ACTIVE, SAMPLE_GLOBAL_FUND, SAMPLE_RISKS } from "./sampleFunds";

describe("home page sample data", () => {
  it("is the same fund file the app reads", () => {
    expect(SAMPLE_GLOBAL_FUND).toEqual(getFund("SAMPLE-GLOBAL"));
    expect(SAMPLE_ACTIVE.ter.page).toBe(getFund("SAMPLE-GLOBAL")!.fees.ter.page);
  });

  it("shows the same risk levels and labels as /explain and the fund page", () => {
    const app = riskAlerts(getFund("SAMPLE-GLOBAL")!);
    expect(SAMPLE_RISKS.map((r) => [r.topic, r.level, r.detail])).toEqual(app.map((a) => [RISK_TOPIC_LABEL[a.topic], a.level, a.title]));
    for (const level of ["high", "medium", "info"] as const) expect(RISK_TAG[level].label).toBe(RISK_LEVEL_LABEL[level]);
  });

  it("labels the discretionary currency hedge like the app does (not a home-page-only level)", () => {
    const fx = SAMPLE_RISKS.find((r) => r.topic === RISK_TOPIC_LABEL.currency)!;
    const appFx = riskAlerts(getFund("SAMPLE-GLOBAL")!).find((a) => a.topic === "currency")!;
    expect(fx.level).toBe(appFx.level);
  });
});

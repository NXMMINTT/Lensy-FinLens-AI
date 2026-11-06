import { describe, expect, it } from "vitest";

import { toCompareFund } from "./compare";
import { getFund, totalAnnualCostRate } from "./funds";
import { HOME_CALC, HOME_FUND_CODES, homeFeeDifference, homeFunds, homeRisks, homeTrueCost } from "./homeFunds";
import { baht } from "./money";
import { riskAlerts } from "./riskRules";
import { feeGapBaht, trueCost } from "./trueCost";

const [A, B] = homeFunds();

describe("home page example funds", () => {
  it("are the real funds B-INNOTECH and K-US500X-A(A), not sample data", () => {
    expect([A.code, B.code]).toEqual([...HOME_FUND_CODES]);
    expect(A.fund.meta.isSample).toBe(false);
    expect(B.fund.meta.isSample).toBe(false);
  });

  it("use the same figures and yearly cost as the app", () => {
    for (const f of [A, B]) {
      const app = getFund(f.code)!;
      expect(f.ter.value).toBe(app.fees.ter.value);
      expect(f.masterFundExpense?.value).toBe(app.fees.masterFundExpense.value);
      expect(f.annualCostRate).toBe(totalAnnualCostRate(app));
    }
  });

  it("compute baht exactly like the calculator", () => {
    for (const f of [A, B]) {
      const c = toCompareFund(getFund(f.code)!);
      const calc = trueCost({ ...HOME_CALC, frontEnd: c.frontEndRate ?? 0, backEnd: c.backEndRate ?? 0, annualCost: c.annualCostRate! });
      expect(homeTrueCost(f).feeCost).toBe(calc.feeCost);
    }
  });

  it("show one fee difference everywhere, and it matches the two baht figures shown next to it", () => {
    const a = Math.round(homeTrueCost(A).feeCost);
    const b = Math.round(homeTrueCost(B).feeCost);
    const gap = homeFeeDifference(A, B);
    expect(gap).toBe(Math.abs(a - b)); // e.g. 38,194 − 11,852 = 26,342, never 26,341
    expect(gap).toBe(feeGapBaht([homeTrueCost(B).feeCost, homeTrueCost(A).feeCost])); // same function as the compare page
    expect(baht(gap)).toBe(`${Math.abs(a - b).toLocaleString("th-TH")} บาท`);
  });

  it("label risks with the app's own rules", () => {
    expect(homeRisks(A).map((r) => r.level)).toEqual(riskAlerts(A.fund).map((a) => a.level));
  });
});

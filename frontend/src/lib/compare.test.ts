import { describe, expect, it } from "vitest";

import { pickInitialCodes, toCompareFund } from "./compare";
import { getFund } from "./funds";

const g = getFund("SAMPLE-GLOBAL")!;

describe("toCompareFund", () => {
  it("lists every fee layer with its page and turns fees into rates", () => {
    const c = toCompareFund(g);
    expect(c.layers.map((l) => l.key)).toEqual(["frontEnd", "ter", "management", "otherExpenses", "masterFundExpense", "rebate", "backEnd", "switching"]);
    expect(c.layers.find((l) => l.key === "masterFundExpense")!.item).toMatchObject({ value: 0.8, page: 14, source: "prospectus" });
    expect(c.annualCostRate).toBeCloseTo(0.0187, 10);
    expect(c.frontEndRate).toBeCloseTo(0.015, 10);
    expect(c.isSample).toBe(true);
    expect(c.masterInclusionUnknown).toBe(false);
  });

  it("Fee X-Ray: every layer has a phase, and fees already inside the TER say they are not added twice", () => {
    const c = toCompareFund(g);
    const phase = Object.fromEntries(c.layers.map((l) => [l.key, l.phase]));
    expect(phase).toMatchObject({ frontEnd: "buy", ter: "hold", masterFundExpense: "hold", backEnd: "sell", switching: "switch" });
    expect(c.layers.find((l) => l.key === "management")!.note).toContain("ไม่นับซ้ำ");
    expect(c.status.kind).toBe("sample"); // sample data is never shown as checked
  });

  it("shows the rest of the TER (TER − management) when the documents give no other-expenses figure", () => {
    const c = toCompareFund(g);
    const other = c.layers.find((l) => l.key === "otherExpenses")!;
    expect(other.item.value).toBeNull();
    expect(other.remainder?.value).toBe(0.2675); // 1.07 − 0.8025, from the fund file
    expect(other.remainder?.ter.page).toBe(2);
    expect(other.remainder?.management.page).toBe(2);
    expect(c.annualCostRate).toBeCloseTo(0.0187, 10); // inside the TER: not added to the total
  });

  it("keeps \"not found\" when it cannot be worked out, and never replaces a figure the documents give", () => {
    const noMgmt = { ...g, fees: { ...g.fees, management: { value: null, page: null, quote: null, source: "factsheet" as const } } };
    expect(toCompareFund(noMgmt).layers.find((l) => l.key === "otherExpenses")!.remainder).toBeUndefined();
    const given = { ...g, fees: { ...g.fees, otherExpenses: { value: 0.1, page: 2, quote: "ค่าใช้จ่ายอื่น 0.10%", source: "factsheet" as const } } };
    expect(toCompareFund(given).layers.find((l) => l.key === "otherExpenses")!.remainder).toBeUndefined();
  });

  it("flags when the documents don't say whether the TER includes the master fund", () => {
    const unknown = { ...g, fees: { ...g.fees, terIncludesMasterFund: { value: null, page: null, quote: null, source: "prospectus" as const } } };
    const c = toCompareFund(unknown);
    expect(c.masterInclusionUnknown).toBe(true);
    expect(c.annualCostRate).toBeCloseTo(0.0187, 10);
  });

  it("cannot calculate without a TER", () => {
    const noTer = { ...g, fees: { ...g.fees, ter: { value: null, page: null, quote: null, source: "factsheet" as const } } };
    expect(toCompareFund(noTer).annualCostRate).toBeNull();
  });
});

describe("pickInitialCodes", () => {
  const all = ["A", "B", "C", "D"].map((code) => ({ ...toCompareFund(g), code }));

  it("uses the codes in the URL when 2–3 are known", () => {
    expect(pickInitialCodes(all, "c,a")).toEqual(["C", "A"]);
    expect(pickInitialCodes(all, "A,B,C,D")).toEqual(["A", "B", "C"]);
  });

  it("falls back to the first funds when the URL has fewer than two known codes", () => {
    expect(pickInitialCodes(all, undefined)).toEqual(["A", "B"]);
    expect(pickInitialCodes(all, "D,nope")).toEqual(["D", "A"]);
  });

  it("allows a single fund when the page needs only one (the calculator)", () => {
    expect(pickInitialCodes(all, "D", 1)).toEqual(["D"]);
    expect(pickInitialCodes(all, undefined, 1)).toEqual(["A", "B"]); // starts with the two featured funds
    expect(pickInitialCodes(all, undefined, 1, 1)).toEqual(["A"]);
    expect(pickInitialCodes(all, "b,c", 1)).toEqual(["B", "C"]);
  });
});

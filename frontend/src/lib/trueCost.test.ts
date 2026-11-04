import { describe, expect, it } from "vitest";

import { trueCost } from "./trueCost";

const base = { principal: 100_000, years: 10, annualReturn: 0.06, frontEnd: 0, backEnd: 0, annualCost: 0 };

describe("trueCost", () => {
  it("costs nothing when there are no fees", () => {
    const r = trueCost(base);
    expect(r.end).toBeCloseTo(179_084.77, 2);
    expect(r.gross).toBeCloseTo(r.end, 6);
    expect(r.feeCost).toBeCloseTo(0, 6);
    expect(r.values).toHaveLength(11);
  });

  it("applies the front-end fee once, at the start", () => {
    const r = trueCost({ ...base, years: 1, frontEnd: 0.01 });
    expect(r.start).toBeCloseTo(99_000, 6);
    expect(r.end).toBeCloseTo(99_000 * 1.06, 6);
  });

  it("applies the back-end fee once, at the end", () => {
    const r = trueCost({ ...base, years: 1, backEnd: 0.01 });
    expect(r.values[1]).toBeCloseTo(106_000, 6);
    expect(r.end).toBeCloseTo(104_940, 6);
    expect(r.feeCost).toBeCloseTo(1_060, 6);
  });

  it("compounds the yearly cost every year", () => {
    const r = trueCost({ ...base, years: 2, annualCost: 0.02 });
    expect(r.values[1]).toBeCloseTo(100_000 * 1.06 * 0.98, 6);
    expect(r.end).toBeCloseTo(100_000 * (1.06 * 0.98) ** 2, 6);
  });

  it("matches the full formula with every fee at once", () => {
    const r = trueCost({ ...base, frontEnd: 0.015, backEnd: 0.005, annualCost: 0.0187 });
    const expected = 100_000 * 0.985 * (1.06 * (1 - 0.0187)) ** 10 * 0.995;
    expect(r.end).toBeCloseTo(expected, 6);
    expect(r.feeCost).toBeCloseTo(r.gross - expected, 6);
  });

  it("rejects inputs outside the allowed range", () => {
    expect(() => trueCost({ ...base, years: 0 })).toThrow(RangeError);
    expect(() => trueCost({ ...base, years: 31 })).toThrow(RangeError);
    expect(() => trueCost({ ...base, years: 2.5 })).toThrow(RangeError);
    expect(() => trueCost({ ...base, principal: -1 })).toThrow(RangeError);
    expect(() => trueCost({ ...base, frontEnd: 1 })).toThrow(RangeError);
    expect(() => trueCost({ ...base, annualCost: -0.01 })).toThrow(RangeError);
  });

  it.each([1, 5, 30])("works for %i year(s): one value per year and fees cost more over time", (years) => {
    const r = trueCost({ ...base, years, annualCost: 0.01 });
    expect(r.values).toHaveLength(years + 1);
    expect(r.end).toBeCloseTo(100_000 * (1.06 * 0.99) ** years, 4);
    expect(r.feeCost).toBeGreaterThan(0);
  });

  it("handles a 0% return: fees simply shrink the money", () => {
    const r = trueCost({ ...base, years: 5, annualReturn: 0, frontEnd: 0.01, annualCost: 0.01 });
    expect(r.gross).toBe(100_000);
    expect(r.end).toBeCloseTo(99_000 * 0.99 ** 5, 6);
    expect(r.feeCost).toBeCloseTo(100_000 - 99_000 * 0.99 ** 5, 6);
  });

  it("100,000 baht, 5 years, 6%: fund A (2.7%/yr + 1.5% buy fee) vs fund B (0.8%/yr) differ by about 13,600 baht", () => {
    const common = { principal: 100_000, years: 5, annualReturn: 0.06, backEnd: 0 };
    const a = trueCost({ ...common, frontEnd: 0.015, annualCost: 0.027 });
    const b = trueCost({ ...common, frontEnd: 0, annualCost: 0.008 });
    const diff = a.feeCost - b.feeCost;
    expect(diff).toBeGreaterThan(13_500);
    expect(diff).toBeLessThan(13_700);
    expect(Math.round(diff)).toBe(13_599);
  });
});

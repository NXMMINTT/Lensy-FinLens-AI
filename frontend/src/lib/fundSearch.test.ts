import { describe, expect, it } from "vitest";

import { norm, RESULT_LIMIT, searchFunds, SUGGEST_COUNT } from "./fundSearch";

const fund = (code: string, nameTh: string, kind = "partial", isSample = false) => ({ code, nameTh, isSample, status: { kind } });

describe("searchFunds", () => {
  const funds = [
    fund("SCBS&P500A", "กองทุนเปิดไทยพาณิชย์หุ้นยูเอส"),
    fund("K-US500X-A(A)", "กองทุนเปิดเค หุ้นยูเอส พาสซีฟ-A", "verified"),
    fund("KFUS-A", "กองทุนเปิดกรุงศรียูเอสอิควิตี้", "verified"),
    fund("SAMPLE-GLOBAL", "กองทุนตัวอย่าง หุ้นโลก", "sample", true),
  ];

  it("ignores case, spaces, hyphens and brackets", () => {
    expect(norm("K-US500X-A(A)")).toBe("kus500xaa");
    expect(searchFunds(funds, "kus500").list.map((f) => f.code)).toEqual(["K-US500X-A(A)"]);
  });

  it("ranks a code that starts with the query above one that only contains it, then names", () => {
    // "500": SCBS&P500A and K-US500X-A(A) both only contain it; "scb" starts SCBS&P500A
    expect(searchFunds(funds, "scb").list.map((f) => f.code)).toEqual(["SCBS&P500A"]);
    expect(searchFunds(funds, "k").list.map((f) => f.code)).toEqual(["KFUS-A", "K-US500X-A(A)"]);
    // a name match comes after code matches
    expect(searchFunds(funds, "ไทยพาณิชย์").list.map((f) => f.code)).toEqual(["SCBS&P500A"]);
    expect(searchFunds(funds, "ยูเอส").list.length).toBe(3);
  });

  it("suggests checked funds first and sample funds last when nothing is typed", () => {
    const { list, total } = searchFunds(funds, "");
    expect(list.slice(0, 2).map((f) => f.status.kind)).toEqual(["verified", "verified"]);
    expect(list.at(-1)?.isSample).toBe(true);
    expect(total).toBe(0);
  });

  it("stays short and fast with thousands of funds", () => {
    const many = Array.from({ length: 1200 }, (_, i) => fund(`FUND-${i}`, `กองทุนทดสอบ ${i}`));
    expect(searchFunds(many, "").list.length).toBe(SUGGEST_COUNT);
    const t0 = performance.now();
    const r = searchFunds(many, "fund");
    expect(performance.now() - t0).toBeLessThan(50);
    expect(r.list.length).toBe(RESULT_LIMIT);
    expect(r.total).toBe(1200);
  });
});

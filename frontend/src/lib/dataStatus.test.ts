import { describe, expect, it } from "vitest";

import { fundDataStatus, thaiDate } from "./dataStatus";
import { getFund } from "./funds";

const g = getFund("SAMPLE-GLOBAL")!;

describe("fundDataStatus", () => {
  it("is verified when every key item is in the documents, with the as-of date and its page", () => {
    const s = fundDataStatus(g);
    expect(s.kind).toBe("verified");
    expect(s.missing).toEqual([]);
    expect(s.asOf).toEqual({ value: "2026-09-30", page: 1, source: "factsheet" });
    expect(s.isSample).toBe(true);
  });

  it("lists missing items as not found (never as zero)", () => {
    const f = structuredClone(g);
    f.fees.backEnd = { value: null, page: null, quote: null, source: "factsheet" };
    const s = fundDataStatus(f);
    expect(s.kind).toBe("partial");
    expect(s.missing).toEqual(["ค่าธรรมเนียมการรับซื้อคืน"]);
  });

  it("asks for the master fund expense only from feeder funds", () => {
    const f = structuredClone(g);
    f.isFeeder = { ...f.isFeeder, value: false };
    f.fees.masterFundExpense = { value: null, page: null, quote: null, source: "prospectus" };
    expect(fundDataStatus(f).kind).toBe("verified");
  });
});

describe("thaiDate", () => {
  it("shows the Buddhist-era year", () => {
    expect(thaiDate("2026-09-30")).toBe("30 ก.ย. 2569");
  });
});

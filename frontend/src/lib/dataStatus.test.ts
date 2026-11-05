import { describe, expect, it } from "vitest";

import { fundDataStatus, SAMPLE_STATUS_LABEL, thaiDate } from "./dataStatus";
import { getFund } from "./funds";

const g = getFund("SAMPLE-GLOBAL")!;
/** The same data as a real (non-sample) fund, to test the checks themselves. */
const real = structuredClone(g);
real.meta.isSample = false;

describe("fundDataStatus", () => {
  it("never shows sample data as checked, and gives it no document date", () => {
    const s = fundDataStatus(g);
    expect(s.kind).toBe("sample");
    expect(s.label).toBe(SAMPLE_STATUS_LABEL);
    expect(s.label).not.toContain("ตรวจกับเอกสารแล้ว");
    expect(s.asOf).toBeNull();
    expect(s.isSample).toBe(true);
  });

  it("is verified when every key item is in the documents, with the as-of date and its page", () => {
    const s = fundDataStatus(real);
    expect(s.kind).toBe("verified");
    expect(s.label).toBe("ตรวจกับเอกสารแล้ว");
    expect(s.missing).toEqual([]);
    expect(s.asOf).toEqual({ value: "2026-09-30", page: 1, source: "factsheet" });
    expect(s.isSample).toBe(false);
  });

  it("lists missing items as not found (never as zero)", () => {
    const f = structuredClone(real);
    f.fees.backEnd = { value: null, page: null, quote: null, source: "factsheet" };
    const s = fundDataStatus(f);
    expect(s.kind).toBe("partial");
    expect(s.missing).toEqual(["ค่าธรรมเนียมการรับซื้อคืน"]);
  });

  it("asks for the master fund expense only from feeder funds", () => {
    const f = structuredClone(real);
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

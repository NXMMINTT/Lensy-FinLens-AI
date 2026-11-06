import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { parseCsv } from "./csv";
import { AWAITING_PAGES_LABEL, fundDataStatus, VERIFIED_LABEL } from "./dataStatus";
import { getFund, getVerifiedFunds } from "./funds";
import { fxHedgingOf, rowToFund } from "./importFunds";

const CSV = path.join(process.cwd(), "data", "funds", "real", "funds.csv");
const rows = parseCsv(fs.readFileSync(CSV, "utf8"));

/** spreadsheet column -> where it lands in the fund */
const NUMBER_COLUMNS: [string, (f: ReturnType<typeof rowToFund>) => number | null][] = [
  ["riskLevel", (f) => f.riskLevel.value],
  ["frontEndFee", (f) => f.fees.frontEnd.value],
  ["backEndFee", (f) => f.fees.backEnd.value],
  ["switchingFee", (f) => f.fees.switching.value],
  ["managementFee", (f) => f.fees.management.value],
  ["ter", (f) => f.fees.ter.value],
  ["masterFundTer", (f) => f.fees.masterFundExpense.value],
];

describe("parseCsv", () => {
  it("reads quoted fields with commas, and the BOM", () => {
    expect(parseCsv('﻿a,b\n1,"x, y"\n')).toEqual([{ a: "1", b: "x, y" }]);
  });
});

describe("import-funds (data/funds/real/funds.csv)", () => {
  it("imports all 20 funds", () => {
    expect(rows).toHaveLength(20);
    expect(rows.map(rowToFund)).toHaveLength(20);
  });

  it("copies every figure exactly; an empty cell stays empty (never 0)", () => {
    for (const row of rows) {
      const f = rowToFund(row);
      for (const [col, get] of NUMBER_COLUMNS) {
        if (row[col] === "") expect(get(f), `${row.fundCode} ${col}`).toBeNull();
        else expect(get(f), `${row.fundCode} ${col}`).toBe(Number(row[col]));
      }
      expect(f.asOfDate.value).toBe(row.asOfDate || null);
      expect(f.meta.dataSource).toBe(row.dataSource);
    }
  });

  it("keeps the pages the sheet gives, and marks SEC data as such", () => {
    const b = rowToFund(rows.find((r) => r.fundCode === "B-INNOTECH")!);
    expect(b.fees.ter).toMatchObject({ value: 1.232, page: 2, source: "factsheet" });
    expect(b.fees.masterFundExpense).toMatchObject({ value: 1.04, page: 1, source: "master" });
    const s = rowToFund(rows.find((r) => r.fundCode === "PRINCIPAL VNEQ-A")!);
    expect(s.fees.ter).toMatchObject({ value: 2.307, page: null, source: "sec" });
    expect(s.fees.management.value).toBe(1.604);
  });

  it("reads the currency hedge wording; unknown wording stays empty and goes to the notes", () => {
    expect(fxHedgingOf("ตามดุลยพินิจของผู้จัดการกองทุน")).toBe("discretionary");
    const kf = rowToFund(rows.find((r) => r.fundCode === "KF-SET50-A")!);
    expect(kf.risk.fxHedging.value).toBeNull();
    expect(kf.meta.notes.join(" ")).toContain("ไม่มี (ลงทุนในไทย)");
  });
});

describe("labels for imported funds", () => {
  it("is in the app next to the verified files", () => {
    expect(getVerifiedFunds().map((f) => f.code)).toEqual(expect.arrayContaining(["SAMPLE-GLOBAL", "B-INNOTECH", "SCBMONEY(A)"]));
  });

  it("shows ✓ checked only when every figure has its page", () => {
    expect(fundDataStatus(getFund("B-INNOTECH")!).label).toBe(VERIFIED_LABEL);
    expect(fundDataStatus(getFund("K-US500X-A(A)")!).label).toBe(AWAITING_PAGES_LABEL); // master fund expense has no page
    const sec = fundDataStatus(getFund("SCBMONEY(A)")!);
    expect(sec.kind).toBe("awaiting-pages");
    expect(sec.label).toBe(AWAITING_PAGES_LABEL);
    expect(sec.dataSource).toContain("Settrade");
  });
});

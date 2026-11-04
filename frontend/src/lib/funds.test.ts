import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getFund, getVerifiedFunds, totalAnnualCostRate } from "./funds";
import { FundSchema } from "./schema";

describe("schema", () => {
  it("rejects a value that has no page or quote", () => {
    const fund = JSON.parse(fs.readFileSync("data/verified/SAMPLE-GLOBAL.json", "utf8"));
    fund.fees.ter.page = null;
    expect(FundSchema.safeParse(fund).success).toBe(false);
  });

  it("accepts null values with no page (the document has no data)", () => {
    const fund = JSON.parse(fs.readFileSync("data/verified/SAMPLE-GLOBAL.json", "utf8"));
    fund.fees.ter = { value: null, page: null, quote: null, source: "factsheet" };
    expect(FundSchema.safeParse(fund).success).toBe(true);
  });
});

describe("funds", () => {
  it("loads the two sample funds from data/verified, marked as sample", () => {
    const funds = getVerifiedFunds();
    expect(funds.map((f) => f.code)).toEqual(expect.arrayContaining(["SAMPLE-GLOBAL", "SAMPLE-INDEX"]));
    expect(funds.filter((f) => f.code.startsWith("SAMPLE-")).every((f) => f.meta.isSample)).toBe(true);
  });

  it("skips files that are still pending", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "finlens-"));
    const fund = JSON.parse(fs.readFileSync("data/verified/SAMPLE-INDEX.json", "utf8"));
    fs.writeFileSync(path.join(dir, "A.json"), JSON.stringify({ ...fund, code: "A" }));
    fs.writeFileSync(path.join(dir, "B.json"), JSON.stringify({ ...fund, code: "B", meta: { ...fund.meta, status: "pending" } }));
    expect(getVerifiedFunds(dir).map((f) => f.code)).toEqual(["A"]);
    fs.rmSync(dir, { recursive: true });
  });

  it("finds a fund by code, ignoring case", () => {
    expect(getFund("sample-global")?.code).toBe("SAMPLE-GLOBAL");
    expect(getFund("NOPE")).toBeUndefined();
  });

  it("adds the master fund expense when the TER does not include it", () => {
    const f = getFund("SAMPLE-GLOBAL")!;
    expect(totalAnnualCostRate(f)).toBeCloseTo(0.0187, 10);
    const included = { ...f, fees: { ...f.fees, terIncludesMasterFund: { ...f.fees.terIncludesMasterFund, value: true } } };
    expect(totalAnnualCostRate(included)).toBeCloseTo(0.0107, 10);
    const noTer = { ...f, fees: { ...f.fees, ter: { value: null, page: null, quote: null, source: "factsheet" as const } } };
    expect(totalAnnualCostRate(noTer)).toBeNull();
  });
});

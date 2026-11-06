/**
 * Fund data for the web and LINE: data/verified/ (status "verified", checked page by page) plus the
 * team's imported spreadsheet data/funds/real/funds.json (status "imported", npm run import-funds),
 * which is labelled by its source and page coverage (lib/dataStatus.ts). Never data/extracted/.
 * Server-side only (uses the file system).
 */
import fs from "node:fs";
import path from "node:path";

import { FundSchema, pctToRate, type Fund } from "./schema";

export const VERIFIED_DIR = path.join(process.cwd(), "data", "verified");

/** The two real funds every page and LINE start with (home page example, compare, calculator, chat). */
export const FEATURED_FUND_CODES = ["B-INNOTECH", "K-US500X-A(A)"] as const;

/** Featured funds first (in that order), then the other real funds, then sample data last. */
export function fundOrder(f: Fund): number {
  const featured = FEATURED_FUND_CODES.findIndex((c) => c.toUpperCase() === f.code.toUpperCase());
  if (featured >= 0) return featured;
  return f.meta.isSample ? 2000 : 1000;
}
export const IMPORTED_FILE = path.join(process.cwd(), "data", "funds", "real", "funds.json");

/** Imported funds; a file that fails validation stops the build instead of showing bad data. */
function importedFunds(file = IMPORTED_FILE): Fund[] {
  if (!fs.existsSync(file)) return [];
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as unknown[];
  return raw.map((r, i) => {
    const parsed = FundSchema.safeParse(r);
    if (!parsed.success) throw new Error(`data/funds/real/funds.json แถว ${i + 1} ไม่ผ่านสคีมา: ${parsed.error.message}`);
    if (parsed.data.meta.status !== "imported") throw new Error(`data/funds/real/funds.json: ${parsed.data.code} ต้องมีสถานะ imported`);
    return parsed.data;
  });
}

let cache: Fund[] | null = null;

/** Every verified fund, validated. A file that fails validation stops the build instead of showing bad data. */
export function getVerifiedFunds(dir = VERIFIED_DIR): Fund[] {
  if (dir === VERIFIED_DIR && cache) return cache;
  const funds = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((f) => {
          const parsed = FundSchema.safeParse(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
          if (!parsed.success) throw new Error(`data/verified/${f} ไม่ผ่านสคีมา: ${parsed.error.message}`);
          return parsed.data;
        })
        .filter((f) => f.meta.status === "verified")
    : [];
  if (dir !== VERIFIED_DIR) return funds;
  // the verified files come first; an imported fund with the same code is skipped
  const seen = new Set(funds.map((f) => f.code.toUpperCase()));
  const all = [...funds, ...importedFunds().filter((f) => !seen.has(f.code.toUpperCase()))];
  // stable sort: within a group the files keep their order
  cache = all.map((f, i) => ({ f, i })).sort((a, b) => fundOrder(a.f) - fundOrder(b.f) || a.i - b.i).map((x) => x.f);
  return cache;
}

export function getFund(code: string, dir = VERIFIED_DIR): Fund | undefined {
  const want = code.trim().toUpperCase();
  return getVerifiedFunds(dir).find((f) => f.code.toUpperCase() === want);
}

/**
 * Total yearly cost (Hidden Fee Detector): TER, plus the master fund's expense when the document
 * says the TER does not include it. When the document does not say (null), the expense is added and
 * the UI must say the total assumes it is not included. Returns null when the TER itself is missing.
 * A rebate the Thai fund gets back from its master fund is subtracted: TER + master − rebate.
 * The result is a rate (0.0187 = 1.87%).
 */
export function totalAnnualCostRate(f: Fund): number | null {
  const ter = f.fees.ter.value;
  if (ter === null) return null;
  const master = f.fees.masterFundExpense.value;
  const addMaster = master !== null && f.fees.terIncludesMasterFund.value !== true;
  const rebate = f.fees.rebate.value ?? 0;
  return pctToRate(ter + (addMaster ? master : 0) - rebate);
}

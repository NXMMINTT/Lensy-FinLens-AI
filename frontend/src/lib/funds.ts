/**
 * Fund data for the web and LINE. Reads ONLY data/verified/ (project brief, Responsible AI rule 4)
 * and only files whose meta.status is "verified". Server-side only (uses the file system).
 */
import fs from "node:fs";
import path from "node:path";

import { FundSchema, pctToRate, type Fund } from "./schema";

export const VERIFIED_DIR = path.join(process.cwd(), "data", "verified");

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
  if (dir === VERIFIED_DIR) cache = funds;
  return funds;
}

export function getFund(code: string, dir = VERIFIED_DIR): Fund | undefined {
  const want = code.trim().toUpperCase();
  return getVerifiedFunds(dir).find((f) => f.code.toUpperCase() === want);
}

/**
 * Total yearly cost (Hidden Fee Detector): TER, plus the master fund's expense when the document
 * says the TER does not include it. When the document does not say (null), the expense is added and
 * the UI must say the total assumes it is not included. Returns null when the TER itself is missing.
 * The result is a rate (0.0187 = 1.87%).
 */
export function totalAnnualCostRate(f: Fund): number | null {
  const ter = f.fees.ter.value;
  if (ter === null) return null;
  const master = f.fees.masterFundExpense.value;
  const addMaster = master !== null && f.fees.terIncludesMasterFund.value !== true;
  return pctToRate(ter + (addMaster ? master : 0));
}

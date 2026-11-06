/**
 * Team spreadsheet (data/funds/real/funds.csv) -> Fund objects with status "imported".
 * Figures are copied as written: an empty cell stays null (shown as "not found in the documents"),
 * and nothing is rounded or filled in. Pure functions; the file I/O is in scripts/import-funds.ts.
 */
import { FundSchema, type DocSource, type Fund, type Sourced } from "./schema";

export type FundRow = Record<string, string>;

const COLUMNS = [
  "fundCode", "fundName", "amc", "fundType", "riskLevel",
  "frontEndFee", "frontEndFee_page", "backEndFee", "backEndFee_page", "switchingFee", "switchingFee_page",
  "managementFee", "managementFee_page", "ter", "ter_page",
  "isFeeder", "masterFundName", "masterFundTer", "masterFundTer_page", "masterFundTer_doc", "rebateFee",
  "fxHedging", "fxHedging_page", "asOfDate", "factsheetUrl", "notes", "dataSource",
] as const;

/** Data that came through Settrade / the SEC rather than from reading the fund's own documents. */
export function isSecSource(dataSource: string): boolean {
  return /settrade|ก\.ล\.ต\./i.test(dataSource);
}

function num(row: FundRow, col: string): number | null {
  const raw = row[col];
  if (raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error(`${row.fundCode}: ${col} is not a number: "${raw}"`);
  return n;
}

function page(row: FundRow, col: string): number | null {
  const raw = row[col] ?? "";
  if (raw === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) throw new Error(`${row.fundCode}: ${col} is not a page number: "${raw}"`);
  return n;
}

const s = <T>(value: T | null, source: DocSource, p: number | null = null): Sourced<T> => ({ value, page: value === null ? null : p, quote: null, source });

/** The spreadsheet's wording for the currency hedge -> the schema's values. Unknown wording stays null (kept in the notes). */
export function fxHedgingOf(text: string): Fund["risk"]["fxHedging"]["value"] {
  if (/ดุลย?พินิจ/.test(text)) return "discretionary";
  if (/บางส่วน/.test(text)) return "partial";
  if (/ทั้งหมด|เต็มจำนวน|เกือบทั้งหมด/.test(text)) return "full";
  if (/^ไม่ป้องกัน/.test(text)) return "none";
  return null;
}

export function rowToFund(row: FundRow): Fund {
  for (const c of COLUMNS) if (!(c in row)) throw new Error(`funds.csv: missing column "${c}"`);
  const src: DocSource = isSecSource(row.dataSource) ? "sec" : "factsheet";
  const isFeeder = row.isFeeder === "" ? null : row.isFeeder.toLowerCase() === "true";
  const fxText = row.fxHedging;
  const fx = fxText === "" ? null : fxHedgingOf(fxText);
  const notes = row.notes
    .split(";")
    .map((n) => n.trim())
    .filter(Boolean);
  if (fxText !== "" && fx === null) notes.push(`นโยบายป้องกันค่าเงินตามเอกสาร: ${fxText}`);

  const fund: Fund = {
    code: row.fundCode,
    nameTh: s(row.fundName || null, src),
    amc: s(row.amc || null, src),
    type: s(row.fundType || null, src),
    isFeeder: s(isFeeder, src),
    masterFundName: s(row.masterFundName || null, src),
    riskLevel: s(num(row, "riskLevel"), src),
    asOfDate: s(row.asOfDate || null, src),
    fees: {
      frontEnd: s(num(row, "frontEndFee"), src, page(row, "frontEndFee_page")),
      backEnd: s(num(row, "backEndFee"), src, page(row, "backEndFee_page")),
      switching: s(num(row, "switchingFee"), src, page(row, "switchingFee_page")),
      management: s(num(row, "managementFee"), src, page(row, "managementFee_page")),
      ter: s(num(row, "ter"), src, page(row, "ter_page")),
      masterFundExpense: s(num(row, "masterFundTer"), "master", page(row, "masterFundTer_page")),
      otherExpenses: s<number>(null, src),
      terIncludesMasterFund: s<boolean>(null, src),
      rebate: s(num(row, "rebateFee"), src),
    },
    risk: {
      fxHedging: s(fx, src, page(row, "fxHedging_page")),
      top5Pct: s<number>(null, src),
      top10Pct: s<number>(null, src),
      topCountry: s<{ name: string; pct: number }>(null, src),
      topSector: s<{ name: string; pct: number }>(null, src),
    },
    redemption: {
      settlementDays: s<number>(null, src),
      frequency: s<string>(null, src),
      lockUp: s<string>(null, src),
    },
    pastReturns: [],
    meta: {
      status: "imported",
      isSample: false,
      extractedAt: null,
      model: null,
      sourceFiles: [
        ...(row.factsheetUrl ? [{ file: row.factsheetUrl, source: "factsheet" as const }] : []),
        ...(row.masterFundTer_doc ? [{ file: row.masterFundTer_doc, source: "master" as const }] : []),
      ],
      verifiedBy: null,
      notes,
      dataSource: row.dataSource || undefined,
    },
  };
  return FundSchema.parse(fund);
}

/**
 * Thai stock data for /stocks from the team's file data/stocks/stocks.csv (copied unchanged).
 * Every figure keeps the text written in the file (`raw`) for display, plus its number for sorting,
 * so nothing is rounded. Empty cells stay null. Server-side only (uses the file system).
 */
import fs from "node:fs";
import path from "node:path";

import { parseCsv } from "./csv";

export const STOCKS_FILE = path.join(process.cwd(), "data", "stocks", "stocks.csv");

/** A figure as written in the file, and its value. */
export type Figure = { raw: string; value: number } | null;

export const STOCK_FIGURES = ["closePrice", "marketCap", "pe", "pbv", "dividendYield", "beta", "ytdChange", "freeFloat", "lastDividend"] as const;
export type StockFigureKey = (typeof STOCK_FIGURES)[number];

export type Stock = {
  symbol: string;
  companyName: string;
  industry: string;
  sector: string;
  figures: Record<StockFigureKey, Figure>;
  lastXD: string | null;
  asOfDate: string;
  sourceUrl: string | null;
};

const COLUMN: Record<StockFigureKey, string> = {
  closePrice: "closePrice_THB",
  marketCap: "marketCap_MB",
  pe: "pe",
  pbv: "pbv",
  dividendYield: "dividendYield_pct",
  beta: "beta",
  ytdChange: "ytdChange_pct",
  freeFloat: "freeFloat_pct",
  lastDividend: "lastDividend_THB",
};

function figure(row: Record<string, string>, col: string): Figure {
  const raw = row[col] ?? "";
  if (raw === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`stocks.csv ${row.symbol}: ${col} is not a number: "${raw}"`);
  return { raw, value };
}

export function rowToStock(row: Record<string, string>): Stock {
  for (const c of ["symbol", "companyName", "industry", "sector", "asOfDate", ...Object.values(COLUMN)]) {
    if (!(c in row)) throw new Error(`stocks.csv: missing column "${c}"`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.asOfDate)) throw new Error(`stocks.csv ${row.symbol}: asOfDate must be YYYY-MM-DD`);
  return {
    symbol: row.symbol,
    companyName: row.companyName,
    industry: row.industry,
    sector: row.sector,
    figures: Object.fromEntries(STOCK_FIGURES.map((k) => [k, figure(row, COLUMN[k])])) as Record<StockFigureKey, Figure>,
    lastXD: row.lastXD || null,
    asOfDate: row.asOfDate,
    sourceUrl: row.sourceUrl || null,
  };
}

let cache: Stock[] | null = null;

export function getStocks(file = STOCKS_FILE): Stock[] {
  if (file === STOCKS_FILE && cache) return cache;
  const stocks = fs.existsSync(file) ? parseCsv(fs.readFileSync(file, "utf8")).map(rowToStock) : [];
  if (file === STOCKS_FILE) cache = stocks;
  return stocks;
}

/** The dates the data is "as of" (normally one), newest first. */
export function stockAsOfDates(stocks: Stock[]): string[] {
  return [...new Set(stocks.map((s) => s.asOfDate))].sort().reverse();
}

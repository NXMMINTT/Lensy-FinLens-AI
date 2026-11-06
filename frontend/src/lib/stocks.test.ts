import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { parseCsv } from "./csv";
import { GLOSSARY } from "./glossary";
import { getStocks, STOCK_FIGURES, stockAsOfDates } from "./stocks";

const ROOT = process.cwd();
const rows = parseCsv(fs.readFileSync(path.join(ROOT, "data", "stocks", "stocks.csv"), "utf8"));
const stocks = getStocks();
const COLUMN: Record<string, string> = {
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

describe("stocks (data/stocks/stocks.csv)", () => {
  it("loads all 20 stocks with their as-of date", () => {
    expect(stocks).toHaveLength(20);
    expect(stockAsOfDates(stocks)).toEqual(["2026-11-05"]);
  });

  it("keeps every figure exactly as written in the file", () => {
    for (const row of rows) {
      const s = stocks.find((x) => x.symbol === row.symbol)!;
      for (const k of STOCK_FIGURES) {
        const raw = row[COLUMN[k]];
        if (raw === "") expect(s.figures[k], `${row.symbol} ${k}`).toBeNull();
        else expect(s.figures[k], `${row.symbol} ${k}`).toEqual({ raw, value: Number(raw) });
      }
    }
  });
});

describe("/stocks page wording", () => {
  // the disclaimer line ("...ไม่ใช่คำแนะนำการลงทุน") comes from PageHeader, required on every page
  const FORBIDDEN = /แนะนำ|ซื้อ|ขาย|ราคาเป้าหมาย/;

  it("never uses advice words in the page, the table or the data it shows", () => {
    const files = ["src/app/(site)/stocks/page.tsx", "src/components/finlens/stocks/StocksTable.tsx"];
    for (const f of files) {
      const code = fs.readFileSync(path.join(ROOT, f), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ""); // ignore comments
      expect(code, f).not.toMatch(FORBIDDEN);
    }
    for (const s of stocks) expect(`${s.symbol} ${s.companyName} ${s.industry} ${s.sector}`, s.symbol).not.toMatch(FORBIDDEN);
  });

  it("links every glossary button to a term that exists", () => {
    const ids = new Set(GLOSSARY.flatMap((g) => g.terms.map((t) => t.id)));
    for (const id of ["pe", "pbv", "dividend-yield", "beta", "market-cap", "free-float"]) expect(ids.has(id), id).toBe(true);
  });
});

describe("stocks named in a question (for /api/ask)", () => {
  it("are found by their whole code only", async () => {
    const { stocksInQuestion } = await import("./ask");
    expect(stocksInQuestion("P/E ของ PTT แปลว่าอะไร", stocks).map((s) => s.symbol)).toEqual(["PTT"]);
    expect(stocksInQuestion("PTTEP ปันผล", stocks).map((s) => s.symbol)).toEqual(["PTTEP"]);
    expect(stocksInQuestion("SCBMONEY(A) คืออะไร", stocks)).toEqual([]); // "SCB" inside a fund code
  });

  it("go to the model with their real figures, date and source", async () => {
    const { stockFacts } = await import("./ask");
    const f = stockFacts(stocks.find((s) => s.symbol === "PTT")!);
    expect(f.text).toContain("P/E (เท่า) = 8.94");
    expect(f.text).toContain("Dividend Yield (%) = 5.9");
    expect(f.text).toContain("5 พ.ย. 2569");
    expect(f.note).toContain("Settrade");
  });

  it("can be used to explain, never to judge", async () => {
    const { checkAiAnswer, stockFacts, STOCK_NO_JUDGEMENT } = await import("./ask");
    const facts = [stockFacts(stocks.find((s) => s.symbol === "PTT")!)];
    const ok = checkAiAnswer({ type: "general", answer: "P/E ของ PTT ณ 5 พ.ย. 2569 เท่ากับ 8.94 เท่า แปลว่าราคาเป็น 8.94 เท่าของกำไรต่อหุ้นค่ะ", refs: [] }, [], {}, "P/E ของ PTT แปลว่าอะไร", facts);
    expect(ok.answer).toContain("8.94");
    expect(ok.note).toContain("PTT");
    const judged = checkAiAnswer({ type: "general", answer: "P/E 8.94 เท่า ถือว่าหุ้นราคาถูก น่าซื้อค่ะ", refs: [] }, [], {}, "P/E ของ PTT แปลว่าอะไร", facts);
    expect(judged.answer).toBe(STOCK_NO_JUDGEMENT);
    const madeUp = checkAiAnswer({ type: "general", answer: "PTT มี P/E 12.5 เท่าค่ะ", refs: [] }, [], {}, "P/E ของ PTT", facts);
    expect(madeUp.answer).not.toContain("12.5");
  });

  it("asking whether to buy is refused by rule", async () => {
    const { classifyQuestion } = await import("./ask");
    expect(classifyQuestion("ควรซื้อ PTT ไหม")).toBe("advice");
  });
});

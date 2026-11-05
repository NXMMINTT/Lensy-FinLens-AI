import { describe, expect, it } from "vitest";

import { checkAiAnswer, classifyQuestion, GENERAL_NOTE, moneyAnswer, NEED_FUND_FOR_NUMBERS, parseMoneyQuestion, SAMPLE_QUESTIONS } from "./ask";
import { getFund } from "./funds";
import { trueCost } from "./trueCost";

const g = getFund("SAMPLE-GLOBAL")!;
const i = getFund("SAMPLE-INDEX")!;

describe("classifyQuestion", () => {
  it.each(["ควรซื้อกองไหน", "กองนี้ซื้อดีไหม", "กองไหนดีกว่ากัน", "แนะนำกองหน่อย", "ปีหน้าจะขึ้นไหม", "ผลตอบแทนในอนาคตเท่าไหร่"])("refuses advice/forecast: %s", (q) => {
    expect(classifyQuestion(q)).toBe("advice");
  });

  it.each(["ลงทุน 100,000 บาท 5 ปี เสียค่าธรรมเนียมกี่บาท", "1 แสน 10 ปี เสียเท่าไหร่", "เสียค่าธรรมเนียมเป็นเงินกี่บาท"])("computes money questions with code: %s", (q) => {
    expect(classifyQuestion(q)).toBe("money");
  });

  it("sends the four sample questions to the AI", () => {
    for (const q of SAMPLE_QUESTIONS) expect(classifyQuestion(q)).toBe("general");
  });
});

describe("parseMoneyQuestion", () => {
  it("reads amounts in baht, Thai units, years and return", () => {
    expect(parseMoneyQuestion("ลงทุน 250,000 บาท 7 ปี ผลตอบแทน 5%")).toEqual({ principal: 250_000, years: 7, returnPct: 5, defaulted: [] });
    expect(parseMoneyQuestion("2 แสน 3 ปี").principal).toBe(200_000);
    expect(parseMoneyQuestion("1.5 ล้าน 20 ปี").principal).toBe(1_500_000);
  });

  it("uses stated defaults when the question leaves them out", () => {
    const p = parseMoneyQuestion("เสียค่าธรรมเนียมกี่บาท");
    expect(p).toMatchObject({ principal: 100_000, years: 10, returnPct: 6 });
    expect(p.defaulted).toHaveLength(3);
  });
});

describe("moneyAnswer", () => {
  it("gives baht from trueCost, with pages and assumptions", () => {
    const r = moneyAnswer([g, i], "ลงทุน 100,000 บาท 10 ปี เสียค่าธรรมเนียมกี่บาท");
    const expected = trueCost({ principal: 100_000, years: 10, annualReturn: 0.06, frontEnd: 0.015, backEnd: 0, annualCost: 0.0187 }).feeCost;
    expect(r.kind).toBe("money");
    expect(r.answer).toContain(Math.round(expected).toLocaleString("th-TH"));
    expect(r.refs.some((x) => x.code === "SAMPLE-GLOBAL" && x.page === 14 && x.source === "prospectus")).toBe(true);
    expect(r.assumptions?.join(" ")).toContain("ไม่ใช่การคาดการณ์");
  });
});

describe("checkAiAnswer", () => {
  it("keeps refs that match the verified data and drops made-up ones", () => {
    const r = checkAiAnswer(
      {
        answer: "ค่าใช้จ่ายของกองทุนหลัก 0.80% ต่อปีค่ะ",
        refs: [
          { code: "SAMPLE-GLOBAL", page: 14, source: "prospectus", quote: g.fees.masterFundExpense.quote },
          { code: "SAMPLE-GLOBAL", page: 5, source: "factsheet", quote: "ข้อความที่ไม่มีจริง" },
        ],
      },
      [g],
      {},
    );
    expect(r.refs).toHaveLength(1);
    expect(r.refs[0].page).toBe(14);
  });

  it("replaces an answer with numbers but no checkable page", () => {
    const r = checkAiAnswer({ answer: "TER 2.5% ค่ะ", refs: [{ code: "SAMPLE-GLOBAL", page: 9, source: "factsheet", quote: "TER 2.5%" }] }, [g], {});
    expect(r.refs).toHaveLength(0);
    expect(r.answer).toContain("ไม่พบข้อมูลนี้ในเอกสาร");
  });

  it("labels an answer with no page and no numbers as general knowledge", () => {
    const r = checkAiAnswer({ answer: "TER (ค่าใช้จ่ายรวม) คือค่าใช้จ่ายที่กองหักจากเงินกองทุนทุกปีค่ะ", refs: [] }, [], {});
    expect(r.answer).toContain("ค่าใช้จ่ายรวม");
    expect(r.note).toBe(GENERAL_NOTE);
  });

  it("never lets a general answer show numbers without a fund document", () => {
    const r = checkAiAnswer({ answer: "TER ปกติอยู่ที่ราว 1.5% ค่ะ", refs: [] }, [], {});
    expect(r.answer).toBe(NEED_FUND_FOR_NUMBERS);
    expect(r.note).toBeUndefined();
  });

  it("accepts a quote found in the PDF text on that page", () => {
    const r = checkAiAnswer(
      { answer: "กองนี้ลงทุนผ่านกองทุนหลักค่ะ (ข้อ 1)", refs: [{ code: "SAMPLE-INDEX", page: 2, source: "prospectus", quote: "ลงทุนในกองทุนหลักไม่น้อยกว่าร้อยละ 80" }] },
      [i],
      { "SAMPLE-INDEX": [{ source: "prospectus", pages: ["สารบัญ", "ลงทุนในกองทุนหลักไมนอยกวารอยละ 80 ของ NAV"] }] },
    );
    expect(r.refs).toHaveLength(1);
  });
});

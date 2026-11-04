import { describe, expect, it } from "vitest";

import { buildFund, documentsText, extractionPrompt, FIELD_BATCHES, FIELDS, mergeAnswers, type ExtractionDoc } from "./extraction";
import { findQuotePage, quoteHasNumber, skeleton } from "./pdfText";

// Page text as unpdf gives it for Thai PDFs: some tone marks missing, sara am split in two.
const docs: ExtractionDoc[] = [
  {
    file: "docs/pdfs/X/factsheet.pdf",
    source: "factsheet",
    pages: ["กองทุนรวมฟดเดอร (Feeder Fund)\nบริษัทจัดการ จํากัด", "คาใชจายรวมทั้งหมด 1.0700 %\nคาธรรมเนียมการขาย 1.50 %", ""],
  },
  {
    file: "docs/pdfs/X/prospectus.pdf",
    source: "prospectus",
    pages: ["สารบัญ", "...", "คาใชจายของกองทุนหลัก (Ongoing charges) 0.80% ตอป"],
  },
];

const entry = (value: unknown, doc: number | null, page: number | null, quote: string | null) => ({ value, doc, page, quote });

function build(fields: Record<string, unknown>) {
  return buildFund({ code: "X", answer: { fields }, docs, model: "test", extractedAt: "2026-11-04T00:00:00Z" });
}

describe("skeleton matching for Thai PDF text", () => {
  it("ignores tone marks, upper/lower vowels, sara am forms and spaces", () => {
    expect(skeleton("ค่าใช้จ่ายรวมทั้งหมด 1.07 %")).toBe(skeleton("คาใชจายรวมทั้งหมด1.07%"));
    expect(skeleton("บริษัทจัดการ จำกัด")).toBe(skeleton("บริษัทจัดการ จํากัด"));
  });

  it("finds the page that holds the quote, preferring the stated page", () => {
    expect(findQuotePage(docs[1].pages, "ค่าใช้จ่ายของกองทุนหลัก (Ongoing charges) 0.80%", 3)).toBe(3);
    expect(findQuotePage(docs[1].pages, "ค่าใช้จ่ายของกองทุนหลัก", 1)).toBe(3);
    expect(findQuotePage(docs[1].pages, "ไม่มีข้อความนี้")).toBeNull();
  });

  it("checks numbers inside a quote", () => {
    expect(quoteHasNumber("ค่าใช้จ่ายรวม 1.0700 %", 1.07)).toBe(true);
    expect(quoteHasNumber("1,000 บาท", 1000)).toBe(true);
    expect(quoteHasNumber("ค่าใช้จ่ายรวม 1.17 %", 1.07)).toBe(false);
  });
});

describe("buildFund", () => {
  it("keeps a value whose quote is on the stated page, with the document's source", () => {
    const f = build({ "fees.masterFundExpense": entry(0.8, 1, 3, "ค่าใช้จ่ายของกองทุนหลัก (Ongoing charges) 0.80% ต่อปี") });
    expect(f.fees.masterFundExpense).toEqual({
      value: 0.8,
      page: 3,
      quote: "ค่าใช้จ่ายของกองทุนหลัก (Ongoing charges) 0.80% ต่อปี",
      source: "prospectus",
    });
    expect(f.meta.status).toBe("pending");
    expect(f.meta.isSample).toBe(false);
  });

  it("corrects the page when the quote is on a different one, and notes it", () => {
    const f = build({ "fees.ter": entry(1.07, 0, 1, "ค่าใช้จ่ายรวมทั้งหมด 1.0700 %") });
    expect(f.fees.ter.page).toBe(2);
    expect(f.meta.notes.some((n) => n.startsWith("fees.ter:") && n.includes("หน้า 2"))).toBe(true);
  });

  it("drops a value whose quote is not in the documents", () => {
    const f = build({ "fees.ter": entry(1.07, 0, 2, "TER 1.07% ต่อปี (แต่งขึ้น)") });
    expect(f.fees.ter.value).toBeNull();
    expect(f.meta.notes.some((n) => n.startsWith("fees.ter:") && n.includes("หาข้อความอ้างอิงในเอกสารไม่เจอ"))).toBe(true);
  });

  it("notes a number that is not in its quote", () => {
    const f = build({ "fees.frontEnd": entry(1.25, 0, 2, "ค่าธรรมเนียมการขาย 1.50 %") });
    expect(f.fees.frontEnd.value).toBe(1.25);
    expect(f.meta.notes.some((n) => n.startsWith("fees.frontEnd:") && n.includes("ไม่อยู่ในข้อความอ้างอิง"))).toBe(true);
  });

  it("keeps null when the document has no data, and rejects values in the wrong shape", () => {
    const f = build({
      "fees.backEnd": entry(null, null, null, null),
      riskLevel: entry(9, 0, 1, "Feeder Fund"),
    });
    expect(f.fees.backEnd.value).toBeNull();
    expect(f.riskLevel.value).toBeNull();
    expect(f.meta.notes.some((n) => n.startsWith("riskLevel:"))).toBe(true);
  });

  it("sets everything to null when the answer is not in the expected shape", () => {
    const f = buildFund({ code: "X", answer: { wrong: true }, docs, model: "test", extractedAt: "x" });
    expect(f.fees.ter.value).toBeNull();
    expect(f.meta.notes[0]).toContain("ผิดรูปแบบ");
  });

  it("collects past returns by period", () => {
    const withReturns: ExtractionDoc[] = [{ ...docs[0], pages: [...docs[0].pages, "ผลการดำเนินงาน 1 ปี 8.40%"] }];
    const f = buildFund({
      code: "X",
      answer: { fields: { "return.1y": entry(8.4, 0, 4, "1 ปี 8.40%"), "benchmark.1y": entry(null, null, null, null) } },
      docs: withReturns,
      model: "test",
      extractedAt: "x",
    });
    expect(f.pastReturns).toEqual([
      { period: "1y", fund: { value: 8.4, page: 4, quote: "1 ปี 8.40%", source: "factsheet" }, benchmark: { value: null, page: null, quote: null, source: "factsheet" } },
    ]);
  });
});

describe("answer formats", () => {
  it("accepts the item list from several batches, with doc/page sent as text", () => {
    const answer = mergeAnswers([
      { items: [{ key: "fees.ter", value: 1.07, doc: "0", page: "2", quote: "ค่าใช้จ่ายรวมทั้งหมด 1.0700 %" }] },
      { items: [{ key: "fees.masterFundExpense", value: 0.8, doc: 1, page: 3, quote: "ค่าใช้จ่ายของกองทุนหลัก (Ongoing charges) 0.80%" }] },
    ]);
    const f = buildFund({ code: "X", answer, docs, model: "t", extractedAt: "x" });
    expect(f.fees.ter).toMatchObject({ value: 1.07, page: 2, source: "factsheet" });
    expect(f.fees.masterFundExpense).toMatchObject({ value: 0.8, page: 3, source: "prospectus" });
  });

  it("drops bare values that come without doc/page/quote", () => {
    const f = buildFund({ code: "X", answer: { fields: { "fees.ter": 1.07, "fees.frontEnd": { value: 1.5, doc: 0, page: 2, quote: "ค่าธรรมเนียมการขาย 1.50 %" } } }, docs, model: "t", extractedAt: "x" });
    expect(f.fees.ter.value).toBeNull();
    expect(f.fees.frontEnd.value).toBe(1.5);
  });

  it("splits the fields into batches that cover every field once", () => {
    expect(FIELD_BATCHES.flat().map((f) => f.key).sort()).toEqual(FIELDS.map((f) => f.key).sort());
  });
});

describe("prompt", () => {
  it("asks the model for every field and labels every page", () => {
    const prompt = extractionPrompt();
    for (const f of FIELDS) expect(prompt).toContain(`${f.key}:`);
    const text = documentsText(docs);
    expect(text).toContain("=== เอกสาร 0 หน้า 2 ===");
    expect(text).toContain("=== เอกสาร 1 หน้า 3 ===");
  });
});

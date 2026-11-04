import { describe, expect, it } from "vitest";

import { buildFund, extractionPrompt, FIELDS, parseCitedLines, type CitedSegment } from "./extraction";

const docs = [
  { file: "docs/pdfs/X/factsheet.pdf", source: "factsheet" as const },
  { file: "docs/pdfs/X/prospectus.pdf", source: "prospectus" as const },
];

const cite = (documentIndex: number, startPage: number, quote: string) => ({ documentIndex, startPage, quote });

function build(segments: CitedSegment[]) {
  return buildFund({ code: "X", segments, documents: docs, model: "test", extractedAt: "2026-11-04T00:00:00Z" });
}

describe("parseCitedLines", () => {
  it("attaches citations from the block that holds the value, even when the key is in another block", () => {
    const lines = parseCitedLines([
      { text: "fees.ter: ", citations: [] },
      { text: "1.07", citations: [cite(0, 2, "ค่าใช้จ่ายรวม 1.07%")] },
      { text: "\nfees.backEnd: null\n", citations: [] },
    ]);
    expect(lines).toEqual([
      { key: "fees.ter", raw: "1.07", citations: [cite(0, 2, "ค่าใช้จ่ายรวม 1.07%")] },
      { key: "fees.backEnd", raw: "null", citations: [] },
    ]);
  });

  it("ignores lines that are not key: value", () => {
    expect(parseCitedLines([{ text: "Here you go\n\nnameTh: \"ก\"\n", citations: [] }])).toHaveLength(1);
  });
});

describe("buildFund", () => {
  it("takes page, quote and source from the citation, not from the model's text", () => {
    const f = build([
      { text: "fees.masterFundExpense: ", citations: [] },
      { text: "0.8", citations: [cite(1, 14, "ค่าใช้จ่ายของกองทุนหลัก 0.80% ต่อปี")] },
      { text: "\n", citations: [] },
    ]);
    expect(f.fees.masterFundExpense).toEqual({ value: 0.8, page: 14, quote: "ค่าใช้จ่ายของกองทุนหลัก 0.80% ต่อปี", source: "prospectus" });
    expect(f.meta.status).toBe("pending");
    expect(f.meta.isSample).toBe(false);
  });

  it("drops a value with no citation to null and notes it for review", () => {
    const f = build([{ text: "fees.ter: 1.07\n", citations: [] }]);
    expect(f.fees.ter.value).toBeNull();
    expect(f.meta.notes.some((n) => n.startsWith("fees.ter:") && n.includes("ไม่มีการอ้างอิง"))).toBe(true);
  });

  it("keeps null when the document has no data, and rejects values in the wrong shape", () => {
    const f = build([
      { text: "fees.backEnd: null\n", citations: [] },
      { text: "riskLevel: 9", citations: [cite(0, 1, "ระดับ 9")] },
      { text: "\n", citations: [] },
    ]);
    expect(f.fees.backEnd.value).toBeNull();
    expect(f.riskLevel.value).toBeNull();
    expect(f.meta.notes.some((n) => n.startsWith("riskLevel:"))).toBe(true);
  });

  it("collects past returns by period", () => {
    const f = build([
      { text: "return.1y: ", citations: [] },
      { text: "8.4", citations: [cite(0, 2, "1 ปี 8.40%")] },
      { text: "\nbenchmark.1y: null\n", citations: [] },
    ]);
    expect(f.pastReturns).toEqual([
      { period: "1y", fund: { value: 8.4, page: 2, quote: "1 ปี 8.40%", source: "factsheet" }, benchmark: { value: null, page: null, quote: null, source: "factsheet" } },
    ]);
  });

  it("asks the model for every field", () => {
    const prompt = extractionPrompt();
    for (const f of FIELDS) expect(prompt).toContain(`${f.key}:`);
  });
});

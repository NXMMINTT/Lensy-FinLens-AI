/**
 * Pure helpers for scripts/extract.ts: the fields we ask the model for, and how its cited answer
 * becomes a Fund. Page numbers and quotes come from the API's citations (page_location), never
 * from text the model typed. A value without a citation is dropped to null and noted for review.
 */
import { z } from "zod";

import { FX_HEDGING, FundSchema, RETURN_PERIODS, type DocSource, type Fund, type Sourced } from "./schema";

const Pct = z.number().min(0).max(100);

type FieldDef = {
  key: string;
  /** What to look for, shown to the model. */
  hint: string;
  value: z.ZodType;
  /** Where the value usually lives; used for `source` when there is no citation. */
  defaultSource: DocSource;
};

const general: FieldDef[] = [
  { key: "nameTh", hint: "ชื่อกองทุนภาษาไทย (string)", value: z.string().min(1), defaultSource: "factsheet" },
  { key: "amc", hint: "บริษัทจัดการ (string)", value: z.string().min(1), defaultSource: "factsheet" },
  { key: "type", hint: "ประเภทกองทุน (string)", value: z.string().min(1), defaultSource: "factsheet" },
  { key: "isFeeder", hint: "เป็นกองทุนรวมฟีดเดอร์หรือไม่ (true/false)", value: z.boolean(), defaultSource: "factsheet" },
  { key: "masterFundName", hint: "ชื่อกองทุนหลัก (string)", value: z.string().min(1), defaultSource: "factsheet" },
  { key: "riskLevel", hint: "ระดับความเสี่ยง 1-8 (integer)", value: z.number().int().min(1).max(8), defaultSource: "factsheet" },
  { key: "asOfDate", hint: "ข้อมูล ณ วันที่ (\"YYYY-MM-DD\", ค.ศ.)", value: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), defaultSource: "factsheet" },
];

const fees: FieldDef[] = [
  { key: "fees.frontEnd", hint: "ค่าธรรมเนียมการขาย % ต่อครั้ง ที่เก็บจริง (number)", value: Pct, defaultSource: "factsheet" },
  { key: "fees.backEnd", hint: "ค่าธรรมเนียมการรับซื้อคืน % ต่อครั้ง ที่เก็บจริง (number)", value: Pct, defaultSource: "factsheet" },
  { key: "fees.switching", hint: "ค่าธรรมเนียมการสับเปลี่ยน % ต่อครั้ง ที่เก็บจริง (number)", value: Pct, defaultSource: "factsheet" },
  { key: "fees.management", hint: "ค่าธรรมเนียมการจัดการ % ต่อปี ที่เก็บจริง (number)", value: Pct, defaultSource: "factsheet" },
  { key: "fees.ter", hint: "ค่าใช้จ่ายรวมทั้งหมด (TER) % ต่อปี ที่เก็บจริง (number)", value: Pct, defaultSource: "factsheet" },
  { key: "fees.masterFundExpense", hint: "ค่าใช้จ่ายของกองทุนหลัก % ต่อปี (number)", value: Pct, defaultSource: "prospectus" },
  { key: "fees.otherExpenses", hint: "ค่าใช้จ่ายอื่น % ต่อปี (number)", value: Pct, defaultSource: "factsheet" },
  {
    key: "fees.terIncludesMasterFund",
    hint: "TER ของกองนี้รวมค่าใช้จ่ายของกองทุนหลักแล้วหรือไม่ (true/false) ตอบเฉพาะเมื่อเอกสารเขียนไว้ชัด",
    value: z.boolean(),
    defaultSource: "prospectus",
  },
];

const risk: FieldDef[] = [
  { key: "risk.fxHedging", hint: `นโยบายป้องกันความเสี่ยงค่าเงิน หนึ่งใน ${FX_HEDGING.map((v) => `"${v}"`).join(", ")}`, value: z.enum(FX_HEDGING), defaultSource: "factsheet" },
  { key: "risk.top5Pct", hint: "สัดส่วนรวม 5 อันดับแรก % (number)", value: Pct, defaultSource: "factsheet" },
  { key: "risk.top10Pct", hint: "สัดส่วนรวม 10 อันดับแรก % (number)", value: Pct, defaultSource: "factsheet" },
  { key: "risk.topCountry", hint: "ประเทศที่ลงทุนมากที่สุด ({\"name\": string, \"pct\": number})", value: z.object({ name: z.string().min(1), pct: Pct }), defaultSource: "factsheet" },
  { key: "risk.topSector", hint: "กลุ่มอุตสาหกรรมที่ลงทุนมากที่สุด ({\"name\": string, \"pct\": number})", value: z.object({ name: z.string().min(1), pct: Pct }), defaultSource: "factsheet" },
];

const redemption: FieldDef[] = [
  { key: "redemption.settlementDays", hint: "ระยะเวลารับเงินค่าขายคืน จำนวนวันทำการหลังวันขาย เช่น T+5 = 5 (integer)", value: z.number().int().min(0).max(60), defaultSource: "factsheet" },
  { key: "redemption.frequency", hint: "วันทำการขายคืน (string)", value: z.string().min(1), defaultSource: "factsheet" },
  { key: "redemption.lockUp", hint: "ระยะเวลาห้ามขายคืน / เงื่อนไขถือขั้นต่ำ (string)", value: z.string().min(1), defaultSource: "prospectus" },
];

const returns: FieldDef[] = RETURN_PERIODS.flatMap((p) => [
  { key: `return.${p}`, hint: `ผลตอบแทนย้อนหลังของกองทุน ช่วง ${p} % (number)`, value: z.number(), defaultSource: "factsheet" as const },
  { key: `benchmark.${p}`, hint: `ผลตอบแทนตัวชี้วัด ช่วง ${p} % (number)`, value: z.number(), defaultSource: "factsheet" as const },
]);

export const FIELDS: FieldDef[] = [...general, ...fees, ...risk, ...redemption, ...returns];

/** The instruction sent after the PDFs. */
export function extractionPrompt(): string {
  return [
    "อ่านเอกสารกองทุนที่แนบมา แล้วตอบทีละบรรทัดตามรูปแบบนี้เท่านั้น:",
    "<key>: <ค่าแบบ JSON>",
    "",
    "กติกา:",
    "- หนึ่งบรรทัดต่อหนึ่ง key ครบทุก key ตามลำดับด้านล่าง ไม่มีข้อความอื่น ไม่ใช้ markdown",
    "- ทุกค่าที่ตอบต้องอ้างอิง (cite) ข้อความในเอกสารที่เป็นที่มาของค่านั้น",
    "- ถ้าเอกสารไม่มีข้อมูล หรือไม่แน่ใจ ให้ตอบ null ห้ามเดา ห้ามคำนวณเอง ห้ามใช้ความรู้นอกเอกสาร",
    "- ตัวเลข % ให้ตอบเป็นตัวเลขตามที่เขียนในเอกสาร เช่น 1.07 (ไม่ใส่เครื่องหมาย %)",
    "- ค่าธรรมเนียม ถ้าเอกสารแสดงทั้ง \"สูงสุดไม่เกิน\" และ \"เก็บจริง\" ให้ใช้ค่าที่เก็บจริง",
    "",
    "keys:",
    ...FIELDS.map((f) => `${f.key}: ${f.hint}`),
  ].join("\n");
}

/** A text block of the response with its PDF citations (simplified from the SDK types). */
export type CitedSegment = {
  text: string;
  citations: { documentIndex: number; startPage: number; quote: string }[];
};

type ParsedLine = { key: string; raw: string; citations: CitedSegment["citations"] };

/** Split the cited answer into `key: value` lines, each with the citations that overlap it. */
export function parseCitedLines(segments: CitedSegment[]): ParsedLine[] {
  let text = "";
  const spans: { start: number; end: number; citations: CitedSegment["citations"] }[] = [];
  for (const s of segments) {
    spans.push({ start: text.length, end: text.length + s.text.length, citations: s.citations });
    text += s.text;
  }
  const lines: ParsedLine[] = [];
  let pos = 0;
  for (const line of text.split("\n")) {
    const start = pos, end = pos + line.length;
    pos = end + 1;
    const m = /^\s*([A-Za-z0-9_.]+)\s*:\s*(.+?)\s*$/.exec(line);
    if (!m) continue;
    const citations = spans.filter((s) => s.citations.length && s.start < end && s.end > start).flatMap((s) => s.citations);
    lines.push({ key: m[1], raw: m[2], citations });
  }
  return lines;
}

function empty<T>(source: DocSource): Sourced<T> {
  return { value: null, page: null, quote: null, source };
}

function setPath(obj: Record<string, unknown>, key: string, v: unknown) {
  const parts = key.split(".");
  let cur = obj;
  for (const p of parts.slice(0, -1)) cur = cur[p] as Record<string, unknown>;
  cur[parts.at(-1)!] = v;
}

export type ExtractionInput = {
  code: string;
  segments: CitedSegment[];
  /** Index = document_index in the request. */
  documents: { file: string; source: DocSource }[];
  model: string;
  extractedAt: string;
};

/** Build a pending Fund from the cited answer. Returns the fund (validated) and review notes. */
export function buildFund({ code, segments, documents, model, extractedAt }: ExtractionInput): Fund {
  const notes: string[] = [];
  const byKey = new Map(parseCitedLines(segments).map((l) => [l.key, l]));

  const fund: Record<string, unknown> = {
    code,
    fees: {},
    risk: {},
    redemption: {},
    pastReturns: [],
  };
  const values = new Map<string, Sourced<unknown>>();

  for (const f of FIELDS) {
    const line = byKey.get(f.key);
    let result: Sourced<unknown> = empty(f.defaultSource);
    if (!line) {
      notes.push(`${f.key}: ไม่มีในคำตอบ ตั้งเป็น null`);
    } else if (line.raw !== "null") {
      let parsed: unknown;
      try {
        parsed = JSON.parse(line.raw);
      } catch {
        parsed = undefined;
      }
      const ok = f.value.safeParse(parsed);
      const cite = line.citations[0];
      if (!ok.success) {
        notes.push(`${f.key}: ค่า ${line.raw} ไม่ผ่านรูปแบบ ตั้งเป็น null`);
      } else if (!cite) {
        notes.push(`${f.key}: ได้ค่า ${line.raw} แต่ไม่มีการอ้างอิงเลขหน้า ตั้งเป็น null (ตรวจในเอกสารเอง)`);
      } else {
        const doc = documents[cite.documentIndex];
        result = {
          value: ok.data,
          page: cite.startPage,
          quote: cite.quote.trim().slice(0, 400) || line.raw,
          source: doc?.source ?? f.defaultSource,
        };
      }
    }
    values.set(f.key, result);
    if (!f.key.startsWith("return.") && !f.key.startsWith("benchmark.")) setPath(fund, f.key, result);
  }

  for (const p of RETURN_PERIODS) {
    const fundRet = values.get(`return.${p}`)!;
    const bench = values.get(`benchmark.${p}`)!;
    if (fundRet.value !== null || bench.value !== null) {
      (fund.pastReturns as unknown[]).push({ period: p, fund: fundRet, benchmark: bench });
    }
  }

  fund.meta = {
    status: "pending",
    isSample: false,
    extractedAt,
    model,
    sourceFiles: documents,
    verifiedBy: null,
    notes,
  };
  return FundSchema.parse(fund);
}

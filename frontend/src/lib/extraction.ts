/**
 * Pure helpers for scripts/extract.ts: the fields we ask the model for, and how its answer becomes
 * a Fund. The model returns value + page + quote; the quote is then searched for in the PDF text, so
 * a page number is only kept when the quote is really on that page.
 */
import { z } from "zod";

import { findQuotePage, quoteHasNumber } from "./pdfText";
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

/** A document as sent to the model: its text, page by page (1-based in the prompt). */
export type ExtractionDoc = { file: string; source: DocSource; pages: string[] };

/** All documents as page-marked text, so the model can say where each value is. */
export function documentsText(docs: ExtractionDoc[], opts: { onlyRelevant?: boolean } = {}): string {
  return docs
    .map((d, i) => {
      const all = d.pages.map((t, p) => ({ t, p }));
      const keep = opts.onlyRelevant && d.source === "prospectus" ? new Set(relevantPageIndexes(d.pages)) : null;
      const pages = keep ? all.filter(({ p }) => keep.has(p)) : all;
      return [
        `<<<เอกสาร ${i}: ${d.source === "factsheet" ? "Fund Fact Sheet" : "หนังสือชี้ชวน"}${keep ? ` (เฉพาะหน้าที่เกี่ยวกับค่าใช้จ่าย ความเสี่ยง และการขายคืน)` : ""}>>>`,
        ...pages.map(({ t, p }) => `=== เอกสาร ${i} หน้า ${p + 1} ===\n${t.trim()}`),
        `<<<จบเอกสาร ${i}>>>`,
      ].join("\n");
    })
    .join("\n\n");
}

// Keywords for the useful parts of a long prospectus, with weights. Thai text from PDFs often loses
// tone marks, so each Thai word is matched with and without them.
const SIGNALS: [RegExp, number][] = [
  [/กองทุนหลัก|master fund|underlying fund/gi, 3],
  [/ongoing charge|total expense|ter\b|ค่าใช้จ่ายรวม|คาใชจายรวม/gi, 4],
  [/ค่าธรรมเนียม|คาธรรมเนียม|management fee/gi, 2],
  [/ค่าใช้จ่าย|คาใชจาย|expense/gi, 1],
  [/ป้องกันความเสี่ยง|ปองกันความเสี่ยง|ปองกันความเสี|อัตราแลกเปลี่ยน|อัตราแลกเปลี|hedg/gi, 2],
  [/รับซื้อคืน|ขายคืน|redemption|t\s*\+\s*\d/gi, 1],
  [/\d+(\.\d+)?\s*%/g, 0.5],
];

/** Page indexes (0-based) of a prospectus worth sending: the top-scoring pages, in page order. */
export function relevantPageIndexes(pages: string[], max = 10): number[] {
  return pages
    .map((t, i) => ({ i, score: SIGNALS.reduce((s, [re, w]) => s + (t.match(re)?.length ?? 0) * w, 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.i)
    .sort((a, b) => a - b);
}

export const EXTRACTION_SYSTEM =
  "คุณช่วยดึงข้อมูลจากเอกสารกองทุนรวมไทยอย่างแม่นยำ ตอบเฉพาะสิ่งที่เอกสารเขียนไว้ ถ้าไม่พบหรือไม่แน่ใจให้ตอบ null ห้ามเดา ห้ามคำนวณเอง ห้ามใช้ความรู้นอกเอกสาร ตอบเป็น JSON เท่านั้น";

/**
 * Fields asked per request. Small batches keep smaller models on the format (value + doc + page +
 * quote for every key); one long list made them drop doc/page/quote halfway through.
 */
export const FIELD_BATCHES: FieldDef[][] = [general, fees, [...risk, ...redemption], returns];

/** The instruction sent after the documents, for one batch of fields. */
export function extractionPrompt(fields: FieldDef[] = FIELDS): string {
  return [
    "จากเอกสารด้านบน (ข้อความถูกดึงจาก PDF อาจมีวรรณยุกต์หายบ้าง) ให้ตอบเป็น JSON object รูปแบบนี้เท่านั้น:",
    '{"items": [{"key": "<key>", "value": <ค่า หรือ null>, "doc": <เลขเอกสาร>, "page": <เลขหน้า>, "quote": "<ข้อความที่คัดลอกตรงจากหน้านั้น>"}]}',
    "",
    "กติกา:",
    `- items ต้องมี ${fields.length} รายการ หนึ่งรายการต่อหนึ่ง key ตามลำดับด้านล่าง ทุกรายการต้องมีครบ 5 ช่อง key, value, doc, page, quote`,
    '- ถ้าไม่พบหรือไม่แน่ใจ ให้ value, doc, page, quote เป็น null ทั้งหมด เช่น {"key": "fees.backEnd", "value": null, "doc": null, "page": null, "quote": null}',
    "- doc และ page เป็นตัวเลข ต้องตรงกับป้าย === เอกสาร X หน้า Y === ที่ข้อความนั้นอยู่",
    "- quote ต้องคัดลอกจากเอกสารตามตัวอักษร ยาวไม่เกิน 120 ตัวอักษร และต้องมีตัวเลขหรือคำตอบนั้นอยู่ในข้อความ",
    "- ตัวเลข % ให้ตอบเป็นตัวเลขตามที่เขียนในเอกสาร เช่น 1.07 (ไม่ใส่เครื่องหมาย %)",
    '- ค่าธรรมเนียม ถ้าเอกสารแสดงทั้ง "สูงสุดไม่เกิน" และ "เก็บจริง" ให้ใช้ค่าที่เก็บจริง',
    '- ถ้าเอกสารเขียนว่า "ไม่มี" หรือ "ไม่เรียกเก็บ" สำหรับค่าธรรมเนียม ให้ตอบ 0 พร้อม quote',
    "",
    "keys:",
    ...fields.map((f) => `${f.key}: ${f.hint}`),
  ].join("\n");
}

const numOrNull = z.preprocess((v) => (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)) ? Number(v) : v), z.number().int().nullable().optional());
const AnswerEntry = z.object({
  value: z.unknown().optional(),
  doc: numOrNull,
  page: numOrNull,
  quote: z.string().nullable().optional(),
});
const AnswerItem = AnswerEntry.extend({ key: z.string() });
/** Either {items: [...]} (current) or {fields: {key: entry}} (older prompt), merged across batches. */
const AnswerSchema = z.union([
  z.object({ items: z.array(AnswerItem) }).transform((a) => ({ fields: Object.fromEntries(a.items.map(({ key, ...e }) => [key, e])) })),
  // older shape; entries that are bare values (no doc/page/quote) are dropped, not trusted
  z.object({ fields: z.record(z.string(), z.unknown()) }).transform((a) => ({
    fields: Object.fromEntries(
      Object.entries(a.fields).flatMap(([k, v]) => {
        const e = AnswerEntry.safeParse(v);
        return e.success && v !== null && typeof v === "object" ? [[k, e.data]] : [];
      }),
    ),
  })),
]);

/** Merge the answers of several batches into one answer for buildFund. */
export function mergeAnswers(answers: unknown[]): unknown {
  const items: unknown[] = [];
  for (const a of answers) {
    const p = AnswerSchema.safeParse(a);
    if (p.success) for (const [key, e] of Object.entries(p.data.fields)) items.push({ key, ...e });
  }
  return { items };
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

/** Locate the quote: stated doc/page first, then any page of any document. */
function locate(docs: ExtractionDoc[], quote: string, doc: number | null | undefined, page: number | null | undefined) {
  const order = [...(doc != null && docs[doc] ? [doc] : []), ...docs.map((_, i) => i).filter((i) => i !== doc)];
  for (const i of order) {
    const p = findQuotePage(docs[i].pages, quote, i === doc ? page : null);
    if (p !== null) return { doc: i, page: p };
  }
  return null;
}

export type ExtractionInput = {
  code: string;
  /** The model's parsed JSON answer. */
  answer: unknown;
  docs: ExtractionDoc[];
  model: string;
  extractedAt: string;
};

/**
 * Build a pending Fund from the model's answer. Every value is checked against the PDF text:
 * the quote must really be in the document (its page is corrected if the model named the wrong
 * one), otherwise the value is dropped to null. Everything a reviewer should look at goes to
 * meta.notes.
 */
export function buildFund({ code, answer, docs, model, extractedAt }: ExtractionInput): Fund {
  const notes: string[] = [];
  const parsedAnswer = AnswerSchema.safeParse(answer);
  if (!parsedAnswer.success) notes.push("คำตอบของ AI ผิดรูปแบบ ทุกค่าตั้งเป็น null");
  const entries = parsedAnswer.success ? parsedAnswer.data.fields : {};

  const fund: Record<string, unknown> = { code, fees: {}, risk: {}, redemption: {}, pastReturns: [] };
  const values = new Map<string, Sourced<unknown>>();

  for (const f of FIELDS) {
    const e = entries[f.key];
    let result: Sourced<unknown> = empty(f.defaultSource);
    if (!e) {
      notes.push(`${f.key}: ไม่มีในคำตอบ ตั้งเป็น null`);
    } else if (e.value !== null && e.value !== undefined) {
      const ok = f.value.safeParse(e.value);
      const quote = e.quote?.trim() ?? "";
      const where = quote ? locate(docs, quote, e.doc, e.page) : null;
      if (!ok.success) {
        notes.push(`${f.key}: ค่า ${JSON.stringify(e.value)} ไม่ผ่านรูปแบบ ตั้งเป็น null`);
      } else if (!where) {
        notes.push(`${f.key}: ได้ค่า ${JSON.stringify(ok.data)} แต่หาข้อความอ้างอิงในเอกสารไม่เจอ ตั้งเป็น null (ตรวจในเอกสารเอง)`);
      } else {
        if (where.doc !== e.doc || where.page !== e.page) {
          notes.push(`${f.key}: AI บอกเอกสาร ${e.doc} หน้า ${e.page} แต่เจอข้อความที่เอกสาร ${where.doc} หน้า ${where.page} ใช้หน้าที่เจอ`);
        }
        if (typeof ok.data === "number" && !quoteHasNumber(quote, ok.data)) {
          notes.push(`${f.key}: ตัวเลข ${ok.data} ไม่อยู่ในข้อความอ้างอิง ตรวจให้แน่ใจ`);
        }
        result = { value: ok.data, page: where.page, quote: quote.slice(0, 400), source: docs[where.doc].source };
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
    sourceFiles: docs.map(({ file, source }) => ({ file, source })),
    verifiedBy: null,
    notes,
  };
  return FundSchema.parse(fund);
}

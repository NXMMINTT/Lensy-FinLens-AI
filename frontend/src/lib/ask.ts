/**
 * AI Explain (project brief feature 4): the parts of POST /api/ask that are plain code.
 * - Advice / ranking / forecast questions get a polite refusal by rule, never sent to the AI.
 * - Money questions are answered with lib/trueCost.ts, never by the AI.
 * - Everything else goes to the AI with verified data only; every page it cites is checked.
 */
import { z } from "zod";

import { NOT_FOUND } from "./disclaimer";
import { FEATURED_FUND_CODES, totalAnnualCostRate } from "./funds";
import { baht, pct } from "./money";
import { findQuotePage, skeleton } from "./pdfText";
import { pctToRate, type DocSource, type Fund, type Sourced } from "./schema";
import { DEFAULT_ANNUAL_RETURN, MAX_YEARS, MIN_YEARS, trueCost } from "./trueCost";

export type AskRef = { code: string; nameTh: string; page: number; source: DocSource; quote: string };
/** `busy`: the AI timed out or hit its rate limit; the answer is a polite "try again" message. */
export type AskKind = "refusal" | "money" | "ai" | "not_configured" | "busy" | "error";
/** `note` marks an answer that explains general finance knowledge instead of citing a fund document. */
export type AskResponse = { kind: AskKind; answer: string; refs: AskRef[]; assumptions?: string[]; note?: string };

export const GENERAL_NOTE = "คำอธิบายนี้เป็นความรู้การเงินทั่วไป ไม่ได้มาจากเอกสารของกองใด";
export const NEED_FUND_FOR_NUMBERS = "ตัวเลขของกองทุนต้องมาจากเอกสารของกองนั้นค่ะ ลองพิมพ์ชื่อกองที่อยากรู้มาด้วยนะคะ";

export const AskRequestSchema = z.object({
  fundCodes: z.array(z.string().min(1).max(40)).min(1).max(3),
  question: z.string().trim().min(2).max(500),
});

/**
 * Example questions shown on /chat and in LINE (the same set the home page used).
 * `short` fits a LINE quick reply button (20 characters); `line` is what LINE sends, naming the
 * funds when the question needs them.
 */
const [FA, FB] = FEATURED_FUND_CODES;
export const EXAMPLE_QUESTIONS: { question: string; short: string; line: string }[] = [
  { question: "TER คืออะไร", short: "TER คืออะไร", line: "TER คืออะไร" },
  { question: "RMF กับ Thai ESG ต่างกันยังไง", short: "RMF กับ Thai ESG", line: "RMF กับ Thai ESG ต่างกันยังไง" },
  { question: `เทียบ ${FA} กับ ${FB}`, short: "เทียบ 2 กอง", line: `เทียบ ${FA} กับ ${FB}` },
  {
    question: "ลงทุน 100,000 บาท 10 ปี เสียค่าธรรมเนียมกี่บาท",
    short: "100,000 บาท 10 ปี",
    line: `${FA} ${FB} ลงทุน 100,000 บาท 10 ปี เสียค่าธรรมเนียมกี่บาท`,
  },
];

export const SAMPLE_QUESTIONS = [
  "กองทุนนี้มีค่าใช้จ่ายอะไรที่ควรระวัง?",
  "มีความเสี่ยงอะไรที่เกี่ยวข้องกับอัตราแลกเปลี่ยน?",
  "ทำไมผลตอบแทนของกองทุนจึงแตกต่างจากสินทรัพย์ที่กองทุนไปลงทุน?",
  "มีเงื่อนไขอะไรที่อาจทำให้ถอนเงินได้ไม่สะดวก?",
] as const;

/* ── classify ── */

/** Always refused: asking what to do, which fund to pick, or what will happen. */
const ADVICE = new RegExp(
  [
    "ควร(จะ)?\\s*(ซื้อ|ขาย|ลงทุน|เลือก|ถือ|สับเปลี่ยน)",
    "(ซื้อ|ขาย|ถือ|เข้า)(ดี|ต่อ|ตอนนี้)?\\s*(ไหม|มั้ย|หรือเปล่า|รึเปล่า|ดีไหม)",
    "กอง\\s*(ไหน|ใด)\\s*(ดี|เด่น|คุ้ม|น่า|เหมาะ|เสี่ยงน้อย|ปลอดภัย|ได้กำไร)",
    "(ตัว|อัน)(ไหน|ใด)\\s*(ดี|คุ้ม|น่า)",
    "เลือก(กอง)?\\s*(ไหน|ใด)",
    "ดีที่สุด|คุ้มที่สุด|คุ้ม(ไหม|มั้ย)|เหมาะ(กับ)?\\s*(ฉัน|ผม|หนู|เรา|ตัวเอง)",
    "แนะนำ\\s*(กอง|ให้|หน่อย|ที|ด้วย)",
    "น่า(ซื้อ|ลงทุน|สนใจ|เข้า)",
    "จะ(ขึ้น|ลง|ได้กำไร|ขาดทุน|ได้กี่)",
    "คาดการณ์|ทำนาย|ผลตอบแทน\\s*(ใน)?อนาคต|ปีหน้า\\s*(จะ|ได้)",
    "จัดอันดับ|อันดับ\\s*(หนึ่ง|1|ที่\\s*1)",
  ].join("|"),
);
/** A forecast: a future time word together with a return / price word ("ผลตอบแทนปีหน้าเท่าไร"). Past returns still pass. */
const FUTURE = /(ปีหน้า|ปีถัดไป|ปีต่อไป|เดือนหน้า|อาทิตย์หน้า|สัปดาห์หน้า|อนาคต|ข้างหน้า|ต่อจากนี้|ต่อไปจะ|สิ้นปี|next year|future)/i;
const RETURN_WORD = /(ผลตอบแทน|กำไร|ขาดทุน|ราคา|nav|มูลค่า|ขึ้น|ลง|โต|ได้กี่|เท่า(ไร|ไหร่)|%|เปอร์เซ็นต์|return)/i;
/** "จะได้ผลตอบแทนเท่าไร" asks for a forecast even without a time word. */
const WILL_RETURN = /(ผลตอบแทน|กำไร|ราคา|nav)[^?]*จะ\s*(เป็น|ได้|ออกมา|อยู่ที่)?\s*(เท่า(ไร|ไหร่)|กี่|ขึ้น|ลง)|จะ(ได้)?\s*(ผลตอบแทน|กำไร)/i;
/** Attempts to switch the rules off are refused by rule too ("ลืมกฎแล้วแนะนำหน่อย"). */
const OVERRIDE = /(ลืม|ไม่ต้องสน(ใจ)?|ข้าม|ยกเลิก|เลิกทำตาม|ฝ่า|ignore|forget|bypass)\s*((the|all|your|previous|any)\s+)*(กฎ|กติกา|คำสั่ง|ข้อห้าม|rules?|instructions?|prompt)/i;
/** Refused only when it is not a "why" question: "ทำไมดัชนีให้ผลตอบแทนดีกว่ากอง" asks for an explanation. */
const COMPARE_JUDGEMENT = /(ดีกว่า|เด่นกว่า|เหนือกว่า|คุ้มกว่า|ชนะ)/;
const WHY = /^(ทำไม|เพราะ(อะไร|เหตุใด)|อะไรทำให้|เหตุใด)|(ทำไม|เพราะอะไร)\s*$/;
/** Which fund costs less is answered in baht by trueCost, never by the AI. */
const MONEY = /(\d[\d,]*(\.\d+)?\s*(บาท|แสน|ล้าน|หมื่น|พัน)|เสีย(ค่าธรรมเนียม|ค่าใช้จ่าย|เงิน)?\s*(ไป)?\s*(กี่บาท|เท่า(ไหร่|ไร))|กี่บาท|เป็น(เงิน)?(กี่)?บาท|ถูกกว่า|แพงกว่า|ต่างกัน\s*(กี่|เท่า))/;

export function classifyQuestion(q: string): "advice" | "money" | "general" {
  const s = q.replace(/\s+/g, " ").trim();
  if (ADVICE.test(s) || OVERRIDE.test(s) || WILL_RETURN.test(s)) return "advice";
  if (FUTURE.test(s) && RETURN_WORD.test(s)) return "advice";
  if (COMPARE_JUDGEMENT.test(s) && !WHY.test(s)) return "advice";
  if (MONEY.test(s)) return "money";
  return "general";
}

export function refusal(): AskResponse {
  return {
    kind: "refusal",
    answer:
      "ขอโทษค่ะ น้อง Lensy แนะนำให้ซื้อหรือขาย จัดอันดับกองทุน หรือคาดการณ์ผลตอบแทนในอนาคตไม่ได้ค่ะ แต่ช่วยเทียบค่าใช้จ่ายทุกชั้น ความเสี่ยงที่เอกสารระบุ และต้นทุนเป็นบาทให้ดูได้นะคะ ลองถามว่า \"เสียค่าธรรมเนียมกี่บาทถ้าลงทุน 100,000 บาท 10 ปี\" ก็ได้ค่ะ",
    refs: [],
  };
}

/* ── money questions: trueCost only ── */

const UNIT: Record<string, number> = { พัน: 1_000, หมื่น: 10_000, แสน: 100_000, ล้าน: 1_000_000 };

export function parseMoneyQuestion(q: string): { principal: number; years: number; returnPct: number; defaulted: string[] } {
  const defaulted: string[] = [];
  const s = q.replace(/(\d),(?=\d{3})/g, "$1");
  let principal: number | null = null;
  const unit = /(\d+(?:\.\d+)?)\s*(พัน|หมื่น|แสน|ล้าน)/.exec(s);
  if (unit) principal = Number(unit[1]) * UNIT[unit[2]];
  const plain = /(\d+(?:\.\d+)?)\s*บาท/.exec(s);
  if (principal === null && plain) principal = Number(plain[1]);
  if (principal === null || !(principal > 0)) {
    principal = 100_000;
    defaulted.push("เงินลงทุน 100,000 บาท");
  }
  const y = /(\d+)\s*ปี/.exec(s);
  let years = y ? Number(y[1]) : NaN;
  if (!Number.isInteger(years) || years < MIN_YEARS || years > MAX_YEARS) {
    years = 10;
    defaulted.push("ถือ 10 ปี");
  }
  const r = /(\d+(?:\.\d+)?)\s*%/.exec(s);
  let returnPct = r ? Number(r[1]) : NaN;
  if (!(returnPct >= 0 && returnPct <= 20)) {
    returnPct = DEFAULT_ANNUAL_RETURN * 100;
    defaulted.push(`ผลตอบแทนสมมติ ${returnPct}% ต่อปี`);
  }
  return { principal: Math.round(principal), years, returnPct, defaulted };
}

function refOf(f: Fund, s: Sourced<unknown>): AskRef[] {
  return s.value !== null && s.page !== null ? [{ code: f.code, nameTh: f.nameTh.value ?? f.code, page: s.page, source: s.source, quote: s.quote ?? "" }] : [];
}

export function moneyAnswer(funds: Fund[], q: string): AskResponse {
  const { principal, years, returnPct, defaulted } = parseMoneyQuestion(q);
  const lines: string[] = [];
  const refs: AskRef[] = [];
  for (const f of funds) {
    const name = f.nameTh.value ?? f.code;
    const annual = totalAnnualCostRate(f);
    if (annual === null) {
      lines.push(`${name}: ${NOT_FOUND} (ค่าใช้จ่ายรวมของกอง) จึงคำนวณไม่ได้ค่ะ`);
      continue;
    }
    const r = trueCost({
      principal,
      years,
      annualReturn: returnPct / 100,
      frontEnd: f.fees.frontEnd.value === null ? 0 : pctToRate(f.fees.frontEnd.value),
      backEnd: f.fees.backEnd.value === null ? 0 : pctToRate(f.fees.backEnd.value),
      annualCost: annual,
    });
    lines.push(`${name}: เสียค่าธรรมเนียมและค่าใช้จ่ายรวมราว ${baht(r.feeCost)} เหลือเงินเมื่อขายราว ${baht(r.end)} (ต้นทุนต่อปีรวม ${pct(annual)})`);
    refs.push(...refOf(f, f.fees.ter), ...refOf(f, f.fees.masterFundExpense), ...refOf(f, f.fees.frontEnd), ...refOf(f, f.fees.backEnd));
  }
  const assumptions = [
    `ลงทุน ${principal.toLocaleString("th-TH")} บาท ถือ ${years} ปี สมมติผลตอบแทนก่อนหักค่าใช้จ่าย ${returnPct}% ต่อปี (สมมติฐาน ไม่ใช่การคาดการณ์)`,
    ...(defaulted.length ? [`คำถามไม่ได้ระบุ จึงใช้ค่าเริ่มต้น: ${defaulted.join(", ")}`] : []),
    "คำนวณด้วยสูตรในระบบ ไม่ได้ให้ AI คิดตัวเลข",
  ];
  return { kind: "money", answer: `น้อง Lensy คำนวณให้แล้วค่ะ\n${lines.join("\n")}`, refs: mergeRefs(refs), assumptions };
}

/** One tag per fund + page + document; quotes from the same page are joined. */
export function mergeRefs(refs: AskRef[]): AskRef[] {
  const out = new Map<string, AskRef>();
  for (const r of refs) {
    const k = `${r.code}|${r.page}|${r.source}`;
    const prev = out.get(k);
    if (!prev) out.set(k, { ...r });
    else if (r.quote && !prev.quote.includes(r.quote)) prev.quote = prev.quote ? `${prev.quote} / ${r.quote}` : r.quote;
  }
  return [...out.values()];
}

/* ── AI questions ── */

export const ASK_SYSTEM = [
  "คุณคือ \"น้อง Lensy\" ผู้ช่วยเทียบและอธิบายกองทุนรวมของ FinLens AI",
  "บุคลิก: สุภาพ เป็นกันเอง ลงท้าย \"ค่ะ\" ประโยคสั้น ใช้คำง่าย ศัพท์เทคนิคใส่วงเล็บอธิบาย",
  "กติกาที่ห้ามละเมิด:",
  "1. เรื่องของกองทุน (ตัวเลข ค่าธรรมเนียม ความเสี่ยง เงื่อนไข) ตอบจากข้อมูลกองทุนและข้อความเอกสารที่ให้มาเท่านั้น ห้ามใช้ความรู้ภายนอก",
  "1.1 ถ้าเป็นคำถามความรู้การเงินทั่วไป (ศัพท์หรือแนวคิด เช่น TER, P/E, กองทุนรวมฟีดเดอร์, RMF / SSF / Thai ESG, กองทุนรวมต่างจากหุ้นอย่างไร, ดอกเบี้ยทบต้น) ให้ type เป็น \"general\" และ refs เป็น [] อธิบายด้วยความรู้ทั่วไปเป็นภาษาง่าย 3–5 ประโยค",
  "1.2 คำตอบ general ใส่ตัวอย่างตัวเลขสั้น ๆ ได้ 1 ตัวอย่างเท่านั้น และต้องขึ้นต้นด้วยคำว่า \"ตัวอย่าง\" หรือ \"สมมติ\" ใช้ตัวเลขกลม ๆ ที่สมมติขึ้น ห้ามใช้ตัวเลขของกองที่ให้มา ห้ามพูดถึงราคา ข่าว สถิติตลาด อัตราภาษีหรือเพดานลดหย่อนที่เป็นตัวเลขจริง และห้ามคาดการณ์",
  "1.3 ถ้าคำถามเกี่ยวกับกองที่ให้มา (ค่าธรรมเนียม ความเสี่ยง ต้นทุน เงื่อนไข) ให้ type เป็น \"fund\" และตอบตามกติกาข้อ 1 และ 5",
  `2. ถ้าไม่มีข้อมูล ให้ตอบว่า "${NOT_FOUND}" ห้ามเดา`,
  "3. ห้ามแนะนำให้ซื้อหรือขาย ห้ามจัดอันดับว่ากองไหนดีกว่า ห้ามคาดการณ์ผลตอบแทนในอนาคต ห้ามพูดเชียร์",
  "4. ห้ามคำนวณตัวเลขเงินเอง ถ้าผู้ใช้อยากรู้เป็นบาท ให้บอกว่าลองใช้หน้าเทียบต้นทุน",
  "5. ทุกตัวเลขที่พูดถึงต้องใส่ใน refs พร้อมรหัสกอง เลขหน้า แหล่ง และ quote ที่คัดลอกตรงจากข้อมูลที่ให้มา",
  "ตอบเป็น JSON: {\"type\": \"fund\" | \"general\", \"answer\": \"<คำตอบไม่เกิน 6 ประโยค>\", \"refs\": [{\"code\": \"<รหัสกอง>\", \"page\": <เลขหน้า>, \"source\": \"factsheet\" | \"prospectus\", \"quote\": \"<ข้อความ>\"}]}",
].join("\n");

/** Verified values with their pages, as compact lines the model can quote from. */
export function fundContext(f: Fund): string {
  const lines: string[] = [`## กอง ${f.code}: ${f.nameTh.value ?? ""}${f.meta.isSample ? " (ข้อมูลตัวอย่าง)" : ""}`];
  const walk = (prefix: string, obj: unknown) => {
    if (!obj || typeof obj !== "object") return;
    const o = obj as Record<string, unknown>;
    if ("value" in o && "page" in o && "source" in o) {
      if (o.value !== null && o.page !== null) lines.push(`- ${prefix}: ${JSON.stringify(o.value)} | ${o.source} หน้า ${o.page}${o.quote ? ` | "${o.quote}"` : ""}`);
      return;
    }
    for (const [k, v] of Object.entries(o)) if (k !== "meta" && k !== "code") walk(prefix ? `${prefix}.${k}` : k, v);
  };
  walk("", f);
  return lines.join("\n");
}

export function askPrompt(funds: Fund[], question: string, pdfText: string): string {
  if (funds.length === 0) {
    return ["ไม่มีกองทุนที่ระบุ ตอบได้เฉพาะความรู้การเงินทั่วไปตามกติกาข้อ 1.1 และ 1.2 (type เป็น general, refs เป็น [])", "", `คำถาม: ${question}`].join("\n");
  }
  return [
    "ข้อมูลกองทุนที่ตรวจแล้ว (ใช้เป็นหลัก):",
    ...funds.map(fundContext),
    ...(pdfText ? ["", "ข้อความจากเอกสารต้นฉบับ (มีป้ายเลขหน้า):", pdfText] : []),
    "",
    `คำถาม: ${question}`,
  ].join("\n");
}

const AiAnswer = z.object({
  /** "general" = finance knowledge, not from a fund document. Missing = treated as a fund answer. */
  type: z.enum(["fund", "general"]).catch("fund"),
  answer: z.string().min(1),
  refs: z
    .array(z.object({ code: z.string(), page: z.number().int().positive(), source: z.enum(["factsheet", "prospectus"]), quote: z.string().min(1) }))
    .default([]),
});

/** Every quote a fund's verified data contains, for checking the AI's refs. */
function verifiedQuotes(f: Fund): { page: number; source: DocSource; quote: string }[] {
  const out: { page: number; source: DocSource; quote: string }[] = [];
  const walk = (obj: unknown) => {
    if (!obj || typeof obj !== "object") return;
    const o = obj as Record<string, unknown>;
    if ("value" in o && "page" in o && "source" in o) {
      if (o.value !== null && typeof o.page === "number" && typeof o.quote === "string") out.push({ page: o.page, source: o.source as DocSource, quote: o.quote });
      return;
    }
    for (const [k, v] of Object.entries(o)) if (k !== "meta") walk(v);
  };
  walk(f);
  return out;
}

/* ── every number in an AI answer needs a source ── */

const THAI_DIGITS = /[๐-๙]/g;
const toArabic = (s: string) => s.replace(THAI_DIGITS, (d) => String(d.charCodeAt(0) - 0x0e50));
const NUMBER = /\d[\d,]*(?:\.\d+)?/g;
/** A small count before or after one of these words ("2 ชั้น", "ข้อ 1") is wording, not a fund figure. */
const COUNT_AFTER = /^\s*(กอง|ชั้น|ข้อ|อย่าง|ประเภท|เรื่อง|ส่วน|แบบ|ขั้น|วิธี|ทาง)/;
const COUNT_BEFORE = /(ข้อ(ที่)?|ขั้น(ที่)?|ส่วน(ที่)?)\s*$/;

function numbersIn(text: string): number[] {
  return [...toArabic(text).matchAll(NUMBER)].map((m) => Number(m[0].replace(/,/g, ""))).filter(Number.isFinite);
}

/**
 * Numbers in `answer` that no accepted source backs (project brief rule 1: no number without a page).
 * A number is backed when it appears (as a value, so 1.07 = 1.0700) in an accepted quote, is a cited
 * page, comes from the question, is part of a fund code or name, or is a small count ("2 ชั้น").
 */
export function unbackedNumbers(answer: string, quotes: string[], pages: number[], question: string, funds: Fund[]): string[] {
  let text = toArabic(answer);
  for (const f of funds) {
    for (const name of [f.code, f.nameTh.value ?? ""].filter(Boolean)) text = text.split(name).join(" ");
  }
  const allowed = new Set<number>([...quotes.flatMap(numbersIn), ...pages, ...numbersIn(question)]);
  const out: string[] = [];
  for (const m of text.matchAll(NUMBER)) {
    const value = Number(m[0].replace(/,/g, ""));
    if (allowed.has(value)) continue;
    const before = text.slice(Math.max(0, m.index - 8), m.index);
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 8);
    if (Number.isInteger(value) && value <= 10 && (COUNT_AFTER.test(after) || COUNT_BEFORE.test(before))) continue;
    out.push(m[0]);
  }
  return out;
}

/* ── general finance knowledge ── */

export const TAX_NOTE = "เงื่อนไขอาจเปลี่ยนตามปีภาษี ควรเช็กกับ ก.ล.ต. หรือกรมสรรพากรอีกครั้ง";
/** Tax-linked products and rules that change by tax year. */
const TAX_TOPIC = /(RMF|SSF|ESG|ภาษี|ลดหย่อน|สรรพากร|ประกันบำนาญ|PVD|กองทุนสำรองเลี้ยงชีพ)/i;
/** A number in a general answer must be presented as a made-up example. */
const EXAMPLE_WORD = /(ตัวอย่าง|สมมติ|เช่น)/;

/** Appends the "rules change by tax year" line when the question or answer is about tax-linked products. */
export function withTaxNote(answer: string, question: string): string {
  if (!TAX_TOPIC.test(question) && !TAX_TOPIC.test(answer)) return answer;
  return answer.includes(TAX_NOTE) ? answer : `${answer} ${TAX_NOTE}`;
}

/** Decimal figures from the selected funds' verified data: a general answer must not reuse them. */
function fundNumbers(funds: Fund[]): Set<number> {
  const out = new Set<number>();
  for (const f of funds) {
    for (const v of verifiedQuotes(f)) for (const n of numbersIn(v.quote)) if (!Number.isInteger(n)) out.add(n);
  }
  return out;
}

/** "this fund" or a selected fund's code / name: the answer is about that fund, not general knowledge. */
function mentionsFund(answer: string, funds: Fund[]): boolean {
  if (/กองนี้|กองทุนนี้/.test(answer)) return true;
  return funds.some((f) => answer.toUpperCase().includes(f.code.toUpperCase()) || (f.nameTh.value !== null && answer.includes(f.nameTh.value)));
}

/**
 * A general answer may show numbers only inside a made-up example (it says "ตัวอย่าง" / "สมมติ" /
 * "เช่น"), must not talk about a selected fund, and must not reuse a precise figure (2+ decimals,
 * e.g. 1.07) from the selected funds' documents. Round example numbers like 1.5% stay allowed.
 */
export function generalAnswerOk(answer: string, funds: Fund[]): boolean {
  if (mentionsFund(answer, funds)) return false;
  const tokens = [...toArabic(answer).matchAll(NUMBER)].map((m) => m[0].replace(/,/g, ""));
  if (tokens.length === 0) return true;
  if (!EXAMPLE_WORD.test(answer)) return false;
  const fromFunds = fundNumbers(funds);
  return !tokens.some((s) => (s.split(".")[1]?.length ?? 0) >= 2 && fromFunds.has(Number(s)));
}

/**
 * Keep only refs whose quote is really in the verified data or the PDF text on that page, then
 * check every number in the answer against those refs. An answer with any unbacked number is
 * replaced: no number without a page.
 */
export function checkAiAnswer(raw: unknown, funds: Fund[], pdfPages: Record<string, { source: DocSource; pages: string[] }[]>, question = ""): AskResponse {
  const parsed = AiAnswer.safeParse(raw);
  if (!parsed.success) return { kind: "error", answer: "ขอโทษค่ะ น้อง Lensy ตอบไม่สำเร็จ ลองถามใหม่อีกครั้งนะคะ", refs: [] };
  const byCode = new Map(funds.map((f) => [f.code.toUpperCase(), f]));
  const refs: AskRef[] = [];
  const acceptedQuotes: string[] = [];
  for (const r of parsed.data.refs) {
    const f = byCode.get(r.code.toUpperCase());
    if (!f) continue;
    const q = skeleton(r.quote);
    const inData = verifiedQuotes(f).some((v) => v.page === r.page && v.source === r.source && (skeleton(v.quote).includes(q) || q.includes(skeleton(v.quote))));
    const docs = pdfPages[f.code] ?? [];
    const inPdf = docs.some((d) => d.source === r.source && findQuotePage(d.pages, r.quote, r.page) === r.page);
    if ((inData || inPdf) && !refs.some((x) => x.code === f.code && x.page === r.page && x.quote === r.quote)) {
      refs.push({ code: f.code, nameTh: f.nameTh.value ?? f.code, page: r.page, source: r.source, quote: r.quote.slice(0, 300) });
      acceptedQuotes.push(r.quote);
    }
  }
  const answer = parsed.data.answer.trim();
  // general finance knowledge: a short made-up example is allowed, fund figures are not
  if (parsed.data.type === "general" && refs.length === 0 && generalAnswerOk(answer, funds)) {
    return { kind: "ai", answer: withTaxNote(answer, question), refs: [], note: GENERAL_NOTE };
  }
  const unbacked = unbackedNumbers(answer, acceptedQuotes, refs.map((r) => r.page), question, funds);
  if (unbacked.length) {
    if (funds.length === 0) return { kind: "ai", answer: NEED_FUND_FOR_NUMBERS, refs: [] };
    return { kind: "ai", answer: `${NOT_FOUND}ที่ยืนยันเลขหน้าได้ค่ะ ลองถามให้เจาะจงขึ้น หรือดูหน้ากองทุนซึ่งบอกที่มาของทุกตัวเลขนะคะ`, refs: [] };
  }
  // no page to cite and no numbers: a general-knowledge explanation, labelled as such
  if (refs.length === 0) return { kind: "ai", answer: withTaxNote(answer, question), refs, note: GENERAL_NOTE };
  return { kind: "ai", answer, refs };
}

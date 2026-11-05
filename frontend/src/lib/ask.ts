/**
 * AI Explain (project brief feature 4): the parts of POST /api/ask that are plain code.
 * - Advice / ranking / forecast questions get a polite refusal by rule, never sent to the AI.
 * - Money questions are answered with lib/trueCost.ts, never by the AI.
 * - Everything else goes to the AI with verified data only; every page it cites is checked.
 */
import { z } from "zod";

import { NOT_FOUND } from "./disclaimer";
import { totalAnnualCostRate } from "./funds";
import { baht, pct } from "./money";
import { findQuotePage, skeleton } from "./pdfText";
import { pctToRate, type DocSource, type Fund, type Sourced } from "./schema";
import { DEFAULT_ANNUAL_RETURN, MAX_YEARS, MIN_YEARS, trueCost } from "./trueCost";

export type AskRef = { code: string; nameTh: string; page: number; source: DocSource; quote: string };
export type AskKind = "refusal" | "money" | "ai" | "not_configured" | "error";
/** `note` marks an answer that explains general finance knowledge instead of citing a fund document. */
export type AskResponse = { kind: AskKind; answer: string; refs: AskRef[]; assumptions?: string[]; note?: string };

export const GENERAL_NOTE = "คำอธิบายนี้เป็นความรู้การเงินทั่วไป ไม่ได้มาจากเอกสารของกองใด";
export const NEED_FUND_FOR_NUMBERS = "ตัวเลขของกองทุนต้องมาจากเอกสารของกองนั้นค่ะ ลองพิมพ์ชื่อกองที่อยากรู้มาด้วยนะคะ";

export const AskRequestSchema = z.object({
  fundCodes: z.array(z.string().min(1).max(40)).min(1).max(3),
  question: z.string().trim().min(2).max(500),
});

export const SAMPLE_QUESTIONS = [
  "กองทุนนี้มีค่าใช้จ่ายอะไรที่ควรระวัง?",
  "มีความเสี่ยงอะไรที่เกี่ยวข้องกับอัตราแลกเปลี่ยน?",
  "ทำไมผลตอบแทนของกองทุนจึงแตกต่างจากสินทรัพย์ที่กองทุนไปลงทุน?",
  "มีเงื่อนไขอะไรที่อาจทำให้ถอนเงินได้ไม่สะดวก?",
] as const;

/* ── classify ── */

const ADVICE = /(ควร(จะ)?(ซื้อ|ขาย|ลงทุน|เลือก|ถือ)|ซื้อ(ดี)?(ไหม|มั้ย|หรือเปล่า)|ขาย(ดี)?(ไหม|มั้ย)|กอง(ไหน|ใด)(ดี|เด่น|คุ้ม)|ดีที่สุด|ดีกว่า|แนะนำ(กอง|ให้|หน่อย)|น่า(ซื้อ|ลงทุน|สนใจ)|คุ้มไหม|จะ(ขึ้น|ลง|ได้กำไร|ขาดทุน)|คาดการณ์|ทำนาย|ผลตอบแทน(ใน)?อนาคต|ปีหน้า(จะ|ได้)|อันดับ)/;
const MONEY = /(\d[\d,]*(\.\d+)?\s*(บาท|แสน|ล้าน|หมื่น|พัน)|เสีย(ค่าธรรมเนียม|ค่าใช้จ่าย|เงิน)?\s*(ไป)?\s*(กี่บาท|เท่า(ไหร่|ไร))|เป็น(เงิน)?(กี่)?บาท)/;

export function classifyQuestion(q: string): "advice" | "money" | "general" {
  const s = q.replace(/\s+/g, " ");
  if (ADVICE.test(s)) return "advice";
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
  return s.value !== null && s.page !== null && s.quote !== null ? [{ code: f.code, nameTh: f.nameTh.value ?? f.code, page: s.page, source: s.source, quote: s.quote }] : [];
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
    else if (!prev.quote.includes(r.quote)) prev.quote = `${prev.quote} / ${r.quote}`;
  }
  return [...out.values()];
}

/* ── AI questions ── */

export const ASK_SYSTEM = [
  "คุณคือ \"น้อง Lensy\" ผู้ช่วยเทียบและอธิบายกองทุนรวมของ FinLens AI",
  "บุคลิก: สุภาพ เป็นกันเอง ลงท้าย \"ค่ะ\" ประโยคสั้น ใช้คำง่าย ศัพท์เทคนิคใส่วงเล็บอธิบาย",
  "กติกาที่ห้ามละเมิด:",
  "1. เรื่องของกองทุน (ตัวเลข ค่าธรรมเนียม ความเสี่ยง เงื่อนไข) ตอบจากข้อมูลกองทุนและข้อความเอกสารที่ให้มาเท่านั้น ห้ามใช้ความรู้ภายนอก",
  "1.1 ถ้าเป็นคำถามความรู้การเงินทั่วไป (ความหมายของศัพท์หรือแนวคิด เช่น TER, กองทุนรวมฟีดเดอร์, การป้องกันความเสี่ยงค่าเงิน, ดอกเบี้ยทบต้น) อธิบายด้วยความรู้ทั่วไปได้ โดยให้ refs เป็น [] และห้ามใส่ตัวเลขใด ๆ ห้ามพูดถึงราคา ข่าว สถิติตลาด หรือข้อมูลกองที่ไม่ได้ให้มา",
  `2. ถ้าไม่มีข้อมูล ให้ตอบว่า "${NOT_FOUND}" ห้ามเดา`,
  "3. ห้ามแนะนำให้ซื้อหรือขาย ห้ามจัดอันดับว่ากองไหนดีกว่า ห้ามคาดการณ์ผลตอบแทนในอนาคต ห้ามพูดเชียร์",
  "4. ห้ามคำนวณตัวเลขเงินเอง ถ้าผู้ใช้อยากรู้เป็นบาท ให้บอกว่าลองใช้หน้าเทียบต้นทุน",
  "5. ทุกตัวเลขที่พูดถึงต้องใส่ใน refs พร้อมรหัสกอง เลขหน้า แหล่ง และ quote ที่คัดลอกตรงจากข้อมูลที่ให้มา",
  "ตอบเป็น JSON: {\"answer\": \"<คำตอบไม่เกิน 6 ประโยค>\", \"refs\": [{\"code\": \"<รหัสกอง>\", \"page\": <เลขหน้า>, \"source\": \"factsheet\" | \"prospectus\", \"quote\": \"<ข้อความ>\"}]}",
].join("\n");

/** Verified values with their pages, as compact lines the model can quote from. */
export function fundContext(f: Fund): string {
  const lines: string[] = [`## กอง ${f.code}: ${f.nameTh.value ?? ""}${f.meta.isSample ? " (ข้อมูลตัวอย่าง)" : ""}`];
  const walk = (prefix: string, obj: unknown) => {
    if (!obj || typeof obj !== "object") return;
    const o = obj as Record<string, unknown>;
    if ("value" in o && "page" in o && "source" in o) {
      if (o.value !== null && o.page !== null) lines.push(`- ${prefix}: ${JSON.stringify(o.value)} | ${o.source} หน้า ${o.page} | "${o.quote}"`);
      return;
    }
    for (const [k, v] of Object.entries(o)) if (k !== "meta" && k !== "code") walk(prefix ? `${prefix}.${k}` : k, v);
  };
  walk("", f);
  return lines.join("\n");
}

export function askPrompt(funds: Fund[], question: string, pdfText: string): string {
  if (funds.length === 0) {
    return ["ไม่มีกองทุนที่ระบุ ตอบได้เฉพาะความรู้การเงินทั่วไปตามกติกาข้อ 1.1 (refs เป็น [] และไม่มีตัวเลข)", "", `คำถาม: ${question}`].join("\n");
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

/**
 * Keep only refs whose quote is really in the verified data or the PDF text on that page.
 * If the answer has numbers but no ref survives, it is replaced: no number without a page.
 */
export function checkAiAnswer(raw: unknown, funds: Fund[], pdfPages: Record<string, { source: DocSource; pages: string[] }[]>): AskResponse {
  const parsed = AiAnswer.safeParse(raw);
  if (!parsed.success) return { kind: "error", answer: "ขอโทษค่ะ น้อง Lensy ตอบไม่สำเร็จ ลองถามใหม่อีกครั้งนะคะ", refs: [] };
  const byCode = new Map(funds.map((f) => [f.code.toUpperCase(), f]));
  const refs: AskRef[] = [];
  for (const r of parsed.data.refs) {
    const f = byCode.get(r.code.toUpperCase());
    if (!f) continue;
    const q = skeleton(r.quote);
    const inData = verifiedQuotes(f).some((v) => v.page === r.page && v.source === r.source && (skeleton(v.quote).includes(q) || q.includes(skeleton(v.quote))));
    const docs = pdfPages[f.code] ?? [];
    const inPdf = docs.some((d) => d.source === r.source && findQuotePage(d.pages, r.quote, r.page) === r.page);
    if ((inData || inPdf) && !refs.some((x) => x.code === f.code && x.page === r.page && x.quote === r.quote)) {
      refs.push({ code: f.code, nameTh: f.nameTh.value ?? f.code, page: r.page, source: r.source, quote: r.quote.slice(0, 300) });
    }
  }
  const answer = parsed.data.answer.trim();
  if (/\d/.test(answer) && refs.length === 0) {
    if (funds.length === 0) return { kind: "ai", answer: NEED_FUND_FOR_NUMBERS, refs: [] };
    return { kind: "ai", answer: `${NOT_FOUND}ที่ยืนยันเลขหน้าได้ค่ะ ลองถามให้เจาะจงขึ้น หรือดูหน้ากองทุนซึ่งมีเลขหน้าทุกค่านะคะ`, refs: [] };
  }
  // no page to cite and no numbers: a general-knowledge explanation, labelled as such
  if (refs.length === 0) return { kind: "ai", answer, refs, note: GENERAL_NOTE };
  return { kind: "ai", answer, refs };
}

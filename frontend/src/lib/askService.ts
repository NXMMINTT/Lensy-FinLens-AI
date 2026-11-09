/**
 * One place that answers a question about funds, used by the web chat (/api/ask) and the LINE bot.
 * Advice -> polite refusal (rule). Money -> trueCost (code). Others -> AI with verified data and the
 * fund's PDF text when available; every cited page is checked. Server-side only.
 */
import fs from "node:fs";
import path from "node:path";

import { AiBusyError, AiNotConfiguredError, AiTimeoutError, ANSWER_LIMITS, aiConfig, chatJson } from "./ai";
import { adviceInAnswer, ASK_SYSTEM, askPrompt, NEED_FUND_FOR_MONEY, checkAiAnswer, checkTaxAnswer, classifyQuestion, isTaxQuestion, moneyAnswer, refusal, stockFacts, stocksInQuestion, TAX_SYSTEM, taxKnowledgeForModel, taxPrompt, type AskResponse } from "./ask";
import { topicFacts, type RefItem } from "./reference";
import { getStocks } from "./stocks";
import { documentsText } from "./extraction";
import { extractPages } from "./pdfText";
import type { DocSource, Fund } from "./schema";

const MAX_PDF_CHARS = 120_000;
const pdfCache = new Map<string, { file: string; source: DocSource; pages: string[] }[]>();

async function pdfDocs(code: string) {
  if (pdfCache.has(code)) return pdfCache.get(code)!;
  const dir = path.join(process.cwd(), "docs", "pdfs", code);
  const docs: { file: string; source: DocSource; pages: string[] }[] = [];
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).filter((n) => n.toLowerCase().endsWith(".pdf")).sort()) {
      try {
        docs.push({ file: f, source: /fact|ffs/i.test(f) ? "factsheet" : "prospectus", pages: await extractPages(path.join(dir, f)) });
      } catch {
        // unreadable PDF: answer from verified data only
      }
    }
  }
  pdfCache.set(code, docs);
  return docs;
}

/** The team's standard text on tax-linked funds (data/knowledge/tax-funds.md), without unchecked TODO lines. */
let taxKnowledge: string | null = null;
function loadTaxKnowledge(): string {
  if (taxKnowledge === null) {
    const file = path.join(process.cwd(), "data", "knowledge", "tax-funds.md");
    taxKnowledge = fs.existsSync(file) ? taxKnowledgeForModel(fs.readFileSync(file, "utf8")) : "";
  }
  return taxKnowledge;
}

export const NOT_CONFIGURED_ANSWER = "ตอนนี้ระบบตอบคำถามด้วย AI ยังไม่ได้ตั้งค่า ระหว่างนี้ดูหน้ากองทุนหรือเทียบต้นทุนได้เลยค่ะ";
const MEANWHILE = "ระหว่างนี้พิมพ์ชื่อกองเพื่อดูการ์ดสรุปที่บอกที่มาของทุกตัวเลข หรือถามเป็นบาท เช่น \"ลงทุน 100,000 บาท 10 ปี เสียกี่บาท\" ได้ทันทีค่ะ";
export const TIMEOUT_ANSWER = `ขอโทษค่ะ ตอนนี้น้อง Lensy ตอบไม่ทัน ลองถามใหม่อีกครั้งนะคะ ${MEANWHILE}`;
export const BUSY_ANSWER = `ขอโทษค่ะ ตอนนี้มีคนถามน้อง Lensy เยอะมาก รอสักครู่แล้วลองใหม่นะคะ ${MEANWHILE}`;
const ERROR_ANSWER = `ขอโทษค่ะ ตอนนี้น้อง Lensy ตอบไม่ได้ ลองถามใหม่อีกครั้งนะคะ ${MEANWHILE}`;

/* ── answer cache: the same question about the same funds and topics gets the same checked answer ── */
const CACHE_MS = 60 * 60 * 1000;
const CACHE_MAX = 500;
const answerCache = new Map<string, { at: number; res: AskResponse }>();

function cacheKey(funds: Fund[], question: string, topics: RefItem[]): string {
  const q = question.toLowerCase().replace(/[\s?？!.,]+/g, " ").trim();
  return [q, funds.map((f) => f.code).sort().join(","), topics.map((t) => t.id).sort().join(",")].join("|");
}

/**
 * Answers a question (web chat and LINE). Model answers are cached for an hour, so repeated
 * questions (a demo, many people trying the same example) do not use the AI quota again.
 */
export async function answerQuestion(funds: Fund[], question: string, topics: RefItem[] = []): Promise<AskResponse> {
  const key = cacheKey(funds, question, topics);
  const hit = answerCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.res;
  const res = await answerFresh(funds, question, topics);
  // the model's own wording is checked too: advice or a promised return becomes the refusal
  const out = res.kind === "ai" && adviceInAnswer(res.answer) ? refusal() : res;
  if (out.kind === "ai" || out.kind === "refusal") {
    if (answerCache.size >= CACHE_MAX) answerCache.delete(answerCache.keys().next().value!);
    answerCache.set(key, { at: Date.now(), res: out });
  }
  return out;
}

async function answerFresh(funds: Fund[], question: string, topics: RefItem[]): Promise<AskResponse> {
  const kind = classifyQuestion(question);
  if (kind === "advice") return refusal();
  // a baht question about funds: the formula; with only topics it goes to the model; with neither, ask for a fund
  if (kind === "money" && funds.length > 0) return moneyAnswer(funds, question);
  if (kind === "money" && topics.length === 0) return { kind: "ai", answer: NEED_FUND_FOR_MONEY, refs: [] };
  if (!aiConfig().apiKey) return { kind: "not_configured", answer: NOT_CONFIGURED_ANSWER, refs: [] };

  try {
    // RMF / SSF / Thai ESG / tax: the model only summarizes the team's standard text
    if (isTaxQuestion(question)) {
      const knowledge = loadTaxKnowledge();
      const { data } = await chatJson(TAX_SYSTEM, taxPrompt(knowledge, question), ANSWER_LIMITS);
      return checkTaxAnswer(data, knowledge, question);
    }
    const pdfPages: Record<string, { source: DocSource; pages: string[] }[]> = {};
    let pdfText = "";
    for (const f of funds) {
      const docs = await pdfDocs(f.code);
      pdfPages[f.code] = docs;
      if (docs.length) pdfText += `\n[กอง ${f.code}]\n${documentsText(docs, { onlyRelevant: true })}`;
    }
    if (pdfText.length > MAX_PDF_CHARS) pdfText = pdfText.slice(0, MAX_PDF_CHARS);
    // a stock named in the question: its real figures go along, to explain them (never to judge)
    const stockList = stocksInQuestion(question, getStocks()).slice(0, 3).map(stockFacts);
    // chosen reference topics: their figures go along with their date and status
    const topicList = topics.map(topicFacts);
    const facts = [...stockList, ...topicList];
    const prompt = askPrompt(funds, question, pdfText, stockList.map((f) => f.text).join("\n"), topicList.map((f) => f.text).join("\n"));
    const { data } = await chatJson(ASK_SYSTEM, prompt, ANSWER_LIMITS);
    return checkAiAnswer(data, funds, pdfPages, question, facts);
  } catch (err) {
    if (err instanceof AiNotConfiguredError) return { kind: "not_configured", answer: NOT_CONFIGURED_ANSWER, refs: [] };
    console.error("[askService]", err instanceof Error ? `${err.name}: ${err.message}` : err);
    if (err instanceof AiBusyError) return { kind: "busy", answer: BUSY_ANSWER, refs: [] };
    if (err instanceof AiTimeoutError) return { kind: "busy", answer: TIMEOUT_ANSWER, refs: [] };
    return { kind: "error", answer: ERROR_ANSWER, refs: [] };
  }
}

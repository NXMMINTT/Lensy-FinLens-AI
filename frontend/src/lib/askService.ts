/**
 * One place that answers a question about funds, used by the web chat (/api/ask) and the LINE bot.
 * Advice -> polite refusal (rule). Money -> trueCost (code). Others -> AI with verified data and the
 * fund's PDF text when available; every cited page is checked. Server-side only.
 */
import fs from "node:fs";
import path from "node:path";

import { AiNotConfiguredError, ANSWER_LIMITS, aiConfig, chatJson } from "./ai";
import { ASK_SYSTEM, askPrompt, checkAiAnswer, classifyQuestion, moneyAnswer, refusal, type AskResponse } from "./ask";
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

export const NOT_CONFIGURED_ANSWER = "ตอนนี้ระบบตอบคำถามด้วย AI ยังไม่ได้ตั้งค่า (KKU_API_KEY) ระหว่างนี้ดูหน้ากองทุนหรือเทียบต้นทุนได้เลยค่ะ";
const ERROR_ANSWER = "ขอโทษค่ะ ตอนนี้น้อง Lensy ตอบไม่ทัน ลองถามใหม่อีกครั้งนะคะ ระหว่างนี้พิมพ์ชื่อกองเพื่อดูการ์ดสรุปพร้อมเลขหน้า หรือถามเป็นบาท เช่น \"ลงทุน 100,000 บาท 10 ปี เสียกี่บาท\" ได้ทันทีค่ะ";

export async function answerQuestion(funds: Fund[], question: string): Promise<AskResponse> {
  const kind = classifyQuestion(question);
  if (kind === "advice") return refusal();
  if (kind === "money") return moneyAnswer(funds, question);
  if (!aiConfig().apiKey) return { kind: "not_configured", answer: NOT_CONFIGURED_ANSWER, refs: [] };

  try {
    const pdfPages: Record<string, { source: DocSource; pages: string[] }[]> = {};
    let pdfText = "";
    for (const f of funds) {
      const docs = await pdfDocs(f.code);
      pdfPages[f.code] = docs;
      if (docs.length) pdfText += `\n[กอง ${f.code}]\n${documentsText(docs, { onlyRelevant: true })}`;
    }
    if (pdfText.length > MAX_PDF_CHARS) pdfText = pdfText.slice(0, MAX_PDF_CHARS);
    const { data } = await chatJson(ASK_SYSTEM, askPrompt(funds, question, pdfText), ANSWER_LIMITS);
    return checkAiAnswer(data, funds, pdfPages, question);
  } catch (err) {
    if (err instanceof AiNotConfiguredError) return { kind: "not_configured", answer: NOT_CONFIGURED_ANSWER, refs: [] };
    console.error("[askService]", err instanceof Error ? err.message : err);
    return { kind: "error", answer: ERROR_ANSWER, refs: [] };
  }
}

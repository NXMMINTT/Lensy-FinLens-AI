/**
 * POST /api/ask  { fundCodes: string[], question: string } -> AskResponse
 * Advice questions: polite refusal (rule). Money questions: trueCost (code). Others: Gemini with
 * verified data (+ the fund's PDF text when docs/pdfs/<code>/ exists); every cited page is checked.
 */
import fs from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { AiNotConfiguredError, aiConfig, chatJson } from "@/lib/ai";
import { AskRequestSchema, ASK_SYSTEM, askPrompt, checkAiAnswer, classifyQuestion, moneyAnswer, refusal, type AskResponse } from "@/lib/ask";
import { documentsText } from "@/lib/extraction";
import { getFund } from "@/lib/funds";
import { extractPages } from "@/lib/pdfText";
import type { DocSource, Fund } from "@/lib/schema";

export const runtime = "nodejs";

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

function json(body: AskResponse, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
  const parsed = AskRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ kind: "error", answer: "รูปแบบคำถามไม่ถูกต้องค่ะ", refs: [] }, 400);
  const { fundCodes, question } = parsed.data;

  const funds = fundCodes.map((c) => getFund(c)).filter((f): f is Fund => Boolean(f));
  if (funds.length === 0) return json({ kind: "error", answer: "ไม่พบกองทุนนี้ในข้อมูลที่ตรวจแล้วค่ะ", refs: [] }, 404);

  const kind = classifyQuestion(question);
  if (kind === "advice") return json(refusal());
  if (kind === "money") return json(moneyAnswer(funds, question));

  if (!aiConfig().apiKey) {
    return json({ kind: "not_configured", answer: "ตอนนี้ระบบตอบคำถามด้วย AI ยังไม่ได้ตั้งค่า (KKU_API_KEY) ระหว่างนี้ดูหน้ากองทุนหรือเทียบต้นทุนได้เลยค่ะ", refs: [] }, 503);
  }

  try {
    const pdfPages: Record<string, { source: DocSource; pages: string[] }[]> = {};
    let pdfText = "";
    for (const f of funds) {
      const docs = await pdfDocs(f.code);
      pdfPages[f.code] = docs;
      if (docs.length) pdfText += `\n[กอง ${f.code}]\n${documentsText(docs)}`;
    }
    if (pdfText.length > MAX_PDF_CHARS) pdfText = pdfText.slice(0, MAX_PDF_CHARS);
    const { data } = await chatJson(ASK_SYSTEM, askPrompt(funds, question, pdfText));
    return json(checkAiAnswer(data, funds, pdfPages));
  } catch (err) {
    if (err instanceof AiNotConfiguredError) return json({ kind: "not_configured", answer: err.message, refs: [] }, 503);
    console.error("[api/ask]", err);
    return json({ kind: "error", answer: "ขอโทษค่ะ ตอนนี้น้อง Lensy ตอบไม่ได้ ลองใหม่อีกครั้งนะคะ", refs: [] }, 502);
  }
}

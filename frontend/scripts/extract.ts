/**
 * npm run extract -- <รหัสกอง>
 *
 * Reads the PDFs in docs/pdfs/<code>/, sends them to the model with citations on, and writes
 * data/extracted/<code>.json with status "pending". The econ team then checks every value against
 * the PDF and moves the file to data/verified/ (see data/README.md).
 *
 * File naming in docs/pdfs/<code>/: a file whose name contains "fact" (or "ffs") is the Fund Fact
 * Sheet; every other PDF is treated as the prospectus (หนังสือชี้ชวน).
 */
import fs from "node:fs";
import path from "node:path";

import Anthropic from "@anthropic-ai/sdk";

import { buildFund, extractionPrompt, type CitedSegment } from "../src/lib/extraction";
import type { DocSource } from "../src/lib/schema";

const MODEL = "claude-sonnet-5-5";
const MAX_PDF_BYTES = 30 * 1024 * 1024; // request limit is 32 MB in total

function loadEnv() {
  if (fs.existsSync(".env.local")) process.loadEnvFile(".env.local");
}

function findDocuments(code: string): { file: string; source: DocSource }[] {
  const dir = path.join("docs", "pdfs", code);
  if (!fs.existsSync(dir)) throw new Error(`ไม่พบโฟลเดอร์ ${dir} ให้วาง PDF ของกองนี้ไว้ก่อน`);
  const pdfs = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort();
  if (pdfs.length === 0) throw new Error(`ไม่มีไฟล์ PDF ใน ${dir}`);
  // Fact sheet first, so document_index 0 is usually the fact sheet.
  return pdfs
    .map((f) => ({ file: path.join(dir, f).replaceAll("\\", "/"), source: (/fact|ffs/i.test(f) ? "factsheet" : "prospectus") as DocSource }))
    .sort((a, b) => (a.source === b.source ? 0 : a.source === "factsheet" ? -1 : 1));
}

async function main() {
  const code = process.argv[2]?.trim();
  if (!code) {
    console.error("วิธีใช้: npm run extract -- <รหัสกอง>");
    process.exit(1);
  }
  loadEnv();
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ยังไม่มี ANTHROPIC_API_KEY ใน .env.local");
    process.exit(1);
  }

  const documents = findDocuments(code);
  const total = documents.reduce((n, d) => n + fs.statSync(d.file).size, 0);
  if (total > MAX_PDF_BYTES) throw new Error(`PDF รวมกัน ${(total / 1e6).toFixed(1)} MB เกินขนาดที่ส่งได้ (ราว 30 MB)`);
  console.log(`กอง ${code}: ส่ง ${documents.length} ไฟล์ (${(total / 1e6).toFixed(1)} MB) ให้ ${MODEL}`);
  documents.forEach((d, i) => console.log(`  [${i}] ${d.source}: ${d.file}`));

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    // If a safety classifier declines, the API retries on a fallback model it picks.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system:
      "คุณช่วยดึงข้อมูลจากเอกสารกองทุนรวมไทยอย่างแม่นยำ ตอบเฉพาะสิ่งที่เอกสารเขียนไว้ และอ้างอิงข้อความในเอกสารทุกครั้ง ถ้าไม่พบให้ตอบ null",
    messages: [
      {
        role: "user",
        content: [
          ...documents.map((d) => ({
            type: "document" as const,
            title: `${d.source === "factsheet" ? "Fund Fact Sheet" : "หนังสือชี้ชวน"} (${path.basename(d.file)})`,
            source: { type: "base64" as const, media_type: "application/pdf" as const, data: fs.readFileSync(d.file).toString("base64") },
            citations: { enabled: true },
          })),
          { type: "text" as const, text: extractionPrompt() },
        ],
      },
    ],
  });
  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") throw new Error(`โมเดลปฏิเสธคำขอ: ${message.stop_details?.explanation ?? "ไม่ทราบเหตุผล"}`);
  if (message.stop_reason === "max_tokens") throw new Error("คำตอบยาวเกิน max_tokens ลองแยกไฟล์หรือเพิ่ม max_tokens");

  const segments: CitedSegment[] = [];
  for (const block of message.content) {
    if (block.type !== "text") continue;
    segments.push({
      text: block.text,
      citations: (block.citations ?? []).flatMap((c) =>
        c.type === "page_location" ? [{ documentIndex: c.document_index, startPage: c.start_page_number, quote: c.cited_text }] : [],
      ),
    });
  }

  const fund = buildFund({ code, segments, documents, model: message.model, extractedAt: new Date().toISOString() });
  const outDir = path.join("data", "extracted");
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${code}.json`);
  fs.writeFileSync(out, JSON.stringify(fund, null, 2) + "\n");

  const notes = fund.meta.notes;
  console.log(`\nบันทึกแล้ว: ${out} (สถานะ pending)`);
  console.log(`โทเคน: input ${message.usage.input_tokens.toLocaleString()} · output ${message.usage.output_tokens.toLocaleString()}`);
  if (notes.length) {
    console.log(`\nสิ่งที่ต้องตรวจเอง (${notes.length} ข้อ):`);
    notes.forEach((n) => console.log(`  - ${n}`));
  }
}

main().catch((err) => {
  if (err instanceof Anthropic.APIError) console.error(`API error ${err.status}: ${err.message}`);
  else console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

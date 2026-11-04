/**
 * npm run extract -- <รหัสกอง>
 *
 * Reads the PDFs in docs/pdfs/<code>/, extracts their text page by page, asks Gemini (KKU
 * IntelSphere) for each field with page + quote, checks every quote against the PDF text, and writes
 * data/extracted/<code>.json with status "pending". The econ team then checks every value against
 * the PDF and moves the file to data/verified/ (see data/README.md).
 *
 * File naming in docs/pdfs/<code>/: a file whose name contains "fact" (or "ffs") is the Fund Fact
 * Sheet; every other PDF is treated as the prospectus (หนังสือชี้ชวน).
 */
import fs from "node:fs";
import path from "node:path";

import { aiConfig, chatJson } from "../src/lib/ai";
import { buildFund, documentsText, EXTRACTION_SYSTEM, extractionPrompt, FIELD_BATCHES, mergeAnswers, type ExtractionDoc } from "../src/lib/extraction";
import { extractPages } from "../src/lib/pdfText";
import type { DocSource } from "../src/lib/schema";

function loadEnv() {
  if (fs.existsSync(".env.local")) process.loadEnvFile(".env.local");
}

function findPdfs(code: string): { file: string; source: DocSource }[] {
  const dir = path.join("docs", "pdfs", code);
  if (!fs.existsSync(dir)) throw new Error(`ไม่พบโฟลเดอร์ ${dir} ให้วาง PDF ของกองนี้ไว้ก่อน`);
  const pdfs = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort();
  if (pdfs.length === 0) throw new Error(`ไม่มีไฟล์ PDF ใน ${dir}`);
  // Fact sheet first, so document 0 is usually the fact sheet.
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
  const { apiKey, model, baseURL } = aiConfig();
  if (!apiKey) {
    console.error("ยังไม่มี KKU_API_KEY ใน .env.local");
    process.exit(1);
  }

  const docs: ExtractionDoc[] = [];
  for (const pdf of findPdfs(code)) {
    const pages = await extractPages(pdf.file);
    const chars = pages.reduce((n, p) => n + p.trim().length, 0);
    console.log(`  [${docs.length}] ${pdf.source}: ${pdf.file} (${pages.length} หน้า, ${chars.toLocaleString()} ตัวอักษร)`);
    if (chars < 200) console.warn(`      ⚠ แทบไม่มีข้อความ อาจเป็น PDF แบบสแกน (ภาพ) ซึ่งดึงข้อความไม่ได้`);
    docs.push({ ...pdf, pages });
  }
  console.log(`กอง ${code}: ส่ง ${docs.length} เอกสารให้ ${model} (${baseURL})`);

  // Ask in small batches: smaller models keep the value + doc + page + quote format better.
  // only the prospectus pages about fees/costs/currency/redemption/risk (saves most of the tokens)
  const docText = documentsText(docs, { onlyRelevant: true });
  const answers: unknown[] = [];
  let usedModel = model;
  const usage = { prompt_tokens: 0, completion_tokens: 0 };
  for (const [i, batch] of FIELD_BATCHES.entries()) {
    const r = await chatJson(EXTRACTION_SYSTEM, `${docText}\n\n${extractionPrompt(batch)}`);
    answers.push(r.data);
    usedModel = r.model;
    usage.prompt_tokens += r.usage?.prompt_tokens ?? 0;
    usage.completion_tokens += r.usage?.completion_tokens ?? 0;
    console.log(`  ชุดที่ ${i + 1}/${FIELD_BATCHES.length} เสร็จ (${batch.length} ค่า)`);
  }
  const fund = buildFund({ code, answer: mergeAnswers(answers), docs, model: usedModel, extractedAt: new Date().toISOString() });

  const outDir = path.join("data", "extracted");
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${code}.json`);
  fs.writeFileSync(out, JSON.stringify(fund, null, 2) + "\n");

  const found = [fund.fees, fund.risk, fund.redemption].flatMap((g) => Object.values(g)).filter((v) => v.value !== null).length;
  console.log(`\nบันทึกแล้ว: ${out} (สถานะ pending) · ได้ค่าพร้อมเลขหน้า ${found} ค่า (ไม่นับข้อมูลทั่วไปและผลตอบแทน)`);
  console.log(`โทเคน: input ${usage.prompt_tokens.toLocaleString()} · output ${usage.completion_tokens.toLocaleString()}`);
  const notes = fund.meta.notes;
  if (notes.length) {
    console.log(`\nสิ่งที่ต้องตรวจเอง (${notes.length} ข้อ):`);
    notes.forEach((n) => console.log(`  - ${n}`));
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

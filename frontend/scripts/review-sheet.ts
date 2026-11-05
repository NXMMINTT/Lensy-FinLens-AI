/**
 * npm run review -- <CODE>
 * Writes docs/review/<CODE>.md from data/extracted/<CODE>.json: one checkbox per value with its page
 * and quote, the items not found, and what to decide. For the econ team to tick against the PDFs
 * before the file moves to data/verified/. Reads only; changes no data.
 */
import fs from "node:fs";
import path from "node:path";

import { FundSchema } from "../src/lib/schema";

const LABEL: Record<string, string> = {
  nameTh: "ชื่อกองทุน",
  amc: "บริษัทจัดการ",
  type: "ประเภทกองทุน",
  isFeeder: "เป็นกองฟีดเดอร์",
  masterFundName: "ชื่อกองทุนหลัก",
  riskLevel: "ระดับความเสี่ยง (1–8)",
  asOfDate: "ข้อมูล ณ วันที่",
  "fees.frontEnd": "ค่าธรรมเนียมการขาย (%)",
  "fees.backEnd": "ค่าธรรมเนียมการรับซื้อคืน (%)",
  "fees.switching": "ค่าธรรมเนียมการสับเปลี่ยน (%)",
  "fees.management": "ค่าธรรมเนียมการจัดการ (% ต่อปี)",
  "fees.ter": "ค่าใช้จ่ายรวม TER (% ต่อปี)",
  "fees.masterFundExpense": "ค่าใช้จ่ายของกองทุนหลัก (% ต่อปี)",
  "fees.otherExpenses": "ค่าใช้จ่ายอื่น (% ต่อปี)",
  "fees.terIncludesMasterFund": "TER รวมค่าใช้จ่ายกองทุนหลักแล้วหรือยัง",
  "risk.fxHedging": "การป้องกันความเสี่ยงค่าเงิน",
  "risk.top5Pct": "5 อันดับแรกรวม (%)",
  "risk.top10Pct": "10 อันดับแรกรวม (%)",
  "risk.topCountry": "ประเทศที่ลงทุนมากสุด",
  "risk.topSector": "กลุ่มธุรกิจที่ลงทุนมากสุด",
  "redemption.settlementDays": "ได้เงินค่าขายคืนภายใน (วันทำการ)",
  "redemption.frequency": "ขายคืนได้บ่อยแค่ไหน",
  "redemption.lockUp": "ระยะเวลาห้ามขาย",
};

/** Feeder funds need these to compare fees; missing ones block the demo. */
const KEY = new Set(["fees.frontEnd", "fees.backEnd", "fees.ter", "fees.masterFundExpense", "fees.terIncludesMasterFund", "riskLevel", "asOfDate"]);

type Row = { key: string; value: unknown; page: number | null; quote: string | null; source: string };

function rows(obj: unknown, prefix = ""): Row[] {
  if (!obj || typeof obj !== "object") return [];
  const o = obj as Record<string, unknown>;
  if ("value" in o && "page" in o && "source" in o) return [{ key: prefix, value: o.value, page: o.page as number | null, quote: o.quote as string | null, source: String(o.source) }];
  return Object.entries(o).flatMap(([k, v]) => (k === "meta" || k === "code" || k === "returns" ? [] : rows(v, prefix ? `${prefix}.${k}` : k)));
}

const show = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v));
const src = (s: string) => (s === "prospectus" ? "หนังสือชี้ชวน" : "Factsheet");

const code = process.argv[2];
if (!code) {
  console.error("ใช้: npm run review -- <รหัสกอง>");
  process.exit(1);
}
const file = path.join("data", "extracted", `${code}.json`);
const fund = FundSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
const all = rows(fund);
const found = all.filter((r) => r.value !== null);
const missing = all.filter((r) => r.value === null);
const name = (k: string) => LABEL[k] ?? k;

const ter = fund.fees.ter.value;
const master = fund.fees.masterFundExpense.value;
const lines: string[] = [
  `# ใบตรวจข้อมูล ${code}: ${fund.nameTh.value ?? ""}`,
  "",
  `ไฟล์: \`${file.replace(/\\/g, "/")}\` · สถานะ: **${fund.meta.status}** · ดึงเมื่อ ${fund.meta.extractedAt ?? "-"} (${fund.meta.model ?? "-"})`,
  "",
  "วิธีตรวจ: เปิด PDF ในโฟลเดอร์ `docs/pdfs/" + code + "/` ไปที่หน้าที่ระบุ ดูว่าตัวเลขและข้อความตรงกัน แล้วติ๊ก [x] ถ้าผิด ให้เขียนค่าที่ถูกพร้อมหน้าไว้ท้ายบรรทัด",
  "",
  "## ต้องตัดสินใจก่อน (กระทบตัวเลขหลักของเดโม)",
  "",
];
if (fund.isFeeder.value === true && fund.fees.terIncludesMasterFund.value === null) {
  lines.push(
    `- [ ] **TER รวมค่าใช้จ่ายกองทุนหลักแล้วหรือยัง?** เอกสารไม่ได้เขียนตรง ๆ ตอนนี้ระบบถือว่า*ยังไม่รวม* จึงบวกเพิ่ม: ${ter ?? "?"}% + ${master ?? "?"}% = **${ter !== null && master !== null ? (ter + master).toFixed(4) : "?"}% ต่อปี** ถ้ารวมแล้ว ต้นทุนต่อปีจะเหลือ ${ter ?? "?"}%`,
  );
}
for (const r of missing.filter((m) => KEY.has(m.key) && m.key !== "fees.terIncludesMasterFund")) lines.push(`- [ ] **${name(r.key)}** ยังไม่พบ ต้องหาใน ${src(r.source)}`);
lines.push("", "## ค่าที่ดึงได้ (ติ๊กเมื่อตรงกับเอกสาร)", "", "| ✓ | รายการ | ค่า | หน้า | ข้อความอ้างอิง |", "|---|---|---|---|---|");
for (const r of found) lines.push(`| [ ] | ${name(r.key)}${KEY.has(r.key) ? " ⭐" : ""} | ${show(r.value).replace(/\s+/g, " ")} | ${r.page ?? "-"} ${src(r.source)} | ${(r.quote ?? "").replace(/\s+/g, " ").replace(/\|/g, "/").slice(0, 140)} |`);
lines.push("", "⭐ = ใช้ในการเทียบและคำนวณ ตรวจก่อน", "", "## ไม่พบในเอกสาร (ถ้าเอกสารไม่มีจริง ปล่อยว่างได้ ห้ามเดา)", "");
for (const r of missing) lines.push(`- [ ] ${name(r.key)} (${src(r.source)})`);
if (fund.meta.notes.length) lines.push("", "## หมายเหตุ", "", ...fund.meta.notes.map((n) => `- ${n}`));
lines.push(
  "",
  "## ตรวจเสร็จแล้ว",
  "",
  `แก้ค่าที่ผิดใน \`${file.replace(/\\/g, "/")}\` แล้วแจ้งทีมพัฒนาเพื่อย้ายไป \`data/verified/${code}.json\` พร้อมตั้ง \`meta.status = "verified"\` และ \`meta.verifiedBy\` เป็นชื่อผู้ตรวจ`,
  "",
);

fs.mkdirSync(path.join("docs", "review"), { recursive: true });
const out = path.join("docs", "review", `${code}.md`);
fs.writeFileSync(out, lines.join("\n"));
console.log(`เขียนแล้ว: ${out} · ค่าที่ดึงได้ ${found.length} · ไม่พบ ${missing.length}`);

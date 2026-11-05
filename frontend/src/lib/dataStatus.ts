/**
 * Data status of a verified fund, shown next to its figures: checked against the documents,
 * or incomplete (which key items the documents don't give), plus the document's "as of" date.
 * "Not found" never means "no fee": missing items are listed as not found, not as zero.
 */
import type { DocSource, Fund, Sourced } from "./schema";

export type DataStatusKind = "verified" | "partial";

export type DataStatus = {
  kind: DataStatusKind;
  label: string;
  /** Thai names of key items the documents don't give */
  missing: string[];
  /** YYYY-MM-DD as written in the document, with its page */
  asOf: { value: string; page: number; source: DocSource } | null;
  isSample: boolean;
};

/** Items a reader needs to judge cost and risk. The master fund expense only counts for feeder funds. */
function keyItems(f: Fund): [string, Sourced<unknown>][] {
  return [
    ["ค่าธรรมเนียมการขาย", f.fees.frontEnd],
    ["ค่าธรรมเนียมการรับซื้อคืน", f.fees.backEnd],
    ["ค่าใช้จ่ายรวม (TER)", f.fees.ter],
    ...(f.isFeeder.value === true ? ([["ค่าใช้จ่ายของกองทุนหลัก", f.fees.masterFundExpense]] as [string, Sourced<unknown>][]) : []),
    ["ระดับความเสี่ยง", f.riskLevel],
  ];
}

export function fundDataStatus(f: Fund): DataStatus {
  const missing = keyItems(f)
    .filter(([, s]) => s.value === null)
    .map(([name]) => name);
  const asOf = f.asOfDate.value !== null && f.asOfDate.page !== null ? { value: f.asOfDate.value, page: f.asOfDate.page, source: f.asOfDate.source } : null;
  return {
    kind: missing.length === 0 ? "verified" : "partial",
    label: missing.length === 0 ? "ตรวจกับเอกสารแล้ว" : "ข้อมูลไม่ครบ",
    missing,
    asOf,
    isSample: f.meta.isSample,
  };
}

const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

/** "2026-09-30" -> "30 ก.ย. 2569" (no time zone involved). */
export function thaiDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${TH_MONTHS[m - 1]} ${y + 543}`;
}

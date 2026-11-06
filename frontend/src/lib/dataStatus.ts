/**
 * Data status of a verified fund, shown next to its figures: checked against the documents,
 * or incomplete (which key items the documents don't give), plus the document's "as of" date.
 * "Not found" never means "no fee": missing items are listed as not found, not as zero.
 */
import { isSecSource } from "./importFunds";
import type { DocSource, Fund, Sourced } from "./schema";

/**
 * `sample`: made-up demo data (meta.isSample); never shown as checked, and has no document date.
 * `awaiting-pages`: imported data where some figure has no page yet (e.g. SEC data via Settrade).
 */
export type DataStatusKind = "verified" | "partial" | "sample" | "awaiting-pages";

export const SAMPLE_STATUS_LABEL = "ข้อมูลตัวอย่าง ไม่ได้ตรวจกับเอกสารจริง";
export const VERIFIED_LABEL = "ตรวจกับเอกสารแล้ว";
export const AWAITING_PAGES_LABEL = "ข้อมูลจาก ก.ล.ต. รอตรวจเลขหน้า";
/** Read from the AMC factsheet itself, but some figures still have no page. */
export const FACTSHEET_PARTIAL_PAGES_LABEL = "อ่านจาก Factsheet แล้ว รอตรวจเลขหน้าบางค่า";

export type DataStatus = {
  kind: DataStatusKind;
  label: string;
  /** Thai names of key items the documents don't give */
  missing: string[];
  /** YYYY-MM-DD as written in the document, with its page (imported data may have none) */
  asOf: { value: string; page: number | null; source: DocSource } | null;
  isSample: boolean;
  /** Where an imported fund's data came from ("ที่มาของข้อมูล") */
  dataSource: string | null;
};

/** The figures an imported fund must have pages for before it can be shown as checked. */
function pagedFigures(f: Fund): Sourced<unknown>[] {
  const { frontEnd, backEnd, switching, management, ter, masterFundExpense } = f.fees;
  return [frontEnd, backEnd, switching, management, ter, masterFundExpense, f.risk.fxHedging];
}

/** Every figure the fund gives has its page. */
export function hasAllPages(f: Fund): boolean {
  return pagedFigures(f).every((s) => s.value === null || s.page !== null);
}

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
  if (f.meta.isSample) return { kind: "sample", label: SAMPLE_STATUS_LABEL, missing: [], asOf: null, isSample: true, dataSource: null };
  const missing = keyItems(f)
    .filter(([, s]) => s.value === null)
    .map(([name]) => name);
  const imported = f.meta.status === "imported";
  const asOf =
    f.asOfDate.value !== null && (f.asOfDate.page !== null || imported) ? { value: f.asOfDate.value, page: f.asOfDate.page, source: f.asOfDate.source } : null;
  const dataSource = f.meta.dataSource ?? null;
  // imported data: "checked" only when every figure has its page; otherwise it waits for pages
  // imported data: the label follows what dataSource says about how it was checked
  if (imported) {
    const src = dataSource ?? "";
    if (/^\s*settrade/i.test(src)) return { kind: "awaiting-pages", label: AWAITING_PAGES_LABEL, missing, asOf, isSample: false, dataSource };
    const checked = /ตรวจเลขหน้า|อ่านจาก Factsheet ของ บลจ\. โดยตรง/.test(src);
    if (!checked) {
      const label = isSecSource(src) ? AWAITING_PAGES_LABEL : FACTSHEET_PARTIAL_PAGES_LABEL;
      if (!hasAllPages(f)) return { kind: "awaiting-pages", label, missing, asOf, isSample: false, dataSource };
    }
  }
  return {
    kind: missing.length === 0 ? "verified" : "partial",
    label: missing.length === 0 ? VERIFIED_LABEL : "ข้อมูลไม่ครบ",
    missing,
    asOf,
    isSample: f.meta.isSample,
    dataSource,
  };
}

const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

/** "2026-09-30" -> "30 ก.ย. 2569" (no time zone involved). */
export function thaiDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${TH_MONTHS[m - 1]} ${y + 543}`;
}

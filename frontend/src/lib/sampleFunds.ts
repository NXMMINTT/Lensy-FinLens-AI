/**
 * Made-up funds for the landing page demo ("ข้อมูลตัวอย่าง"). Not real funds, not from real documents.
 * Every value carries a page and source like the real data will (project brief `Sourced<T>`),
 * so the demo follows the same "every number has a page" rule. Real data lives in data/verified/.
 */
import { trueCost } from "@/lib/trueCost";

export type DocSource = "factsheet" | "prospectus";
export type SampleSourced<T> = { value: T; page: number; source: DocSource };

export type SampleFund = {
  code: string;
  nameTh: string;
  isFeeder: boolean;
  /** % per year, as decimals */
  ter: SampleSourced<number>;
  masterFundExpense: SampleSourced<number> | null;
  /** % per transaction, as decimals */
  frontEnd: SampleSourced<number>;
  backEnd: SampleSourced<number>;
};

export const SAMPLE_ACTIVE: SampleFund = {
  code: "SAMPLE-GLOBAL",
  nameTh: "กองทุนตัวอย่าง หุ้นโลก",
  isFeeder: true,
  ter: { value: 0.0107, page: 2, source: "factsheet" },
  masterFundExpense: { value: 0.008, page: 14, source: "prospectus" },
  frontEnd: { value: 0.015, page: 2, source: "factsheet" },
  backEnd: { value: 0, page: 2, source: "factsheet" },
};

export const SAMPLE_INDEX: SampleFund = {
  code: "SAMPLE-INDEX",
  nameTh: "กองทุนตัวอย่าง ดัชนีโลก",
  isFeeder: true,
  ter: { value: 0.0045, page: 2, source: "factsheet" },
  masterFundExpense: { value: 0.0007, page: 12, source: "prospectus" },
  frontEnd: { value: 0, page: 2, source: "factsheet" },
  backEnd: { value: 0, page: 2, source: "factsheet" },
};

/** TER + master fund expense (the sample TERs exclude the master fund's costs). */
export function sampleAnnualCost(f: SampleFund): number {
  return f.ter.value + (f.masterFundExpense?.value ?? 0);
}

/** Assumptions shown next to every calculated figure. */
export const SAMPLE_CALC = { principal: 100_000, years: 10, annualReturn: 0.06 } as const;

export function sampleTrueCost(f: SampleFund) {
  return trueCost({
    ...SAMPLE_CALC,
    frontEnd: f.frontEnd.value,
    backEnd: f.backEnd.value,
    annualCost: sampleAnnualCost(f),
  });
}

export const SOURCE_LABEL: Record<DocSource, string> = {
  factsheet: "Factsheet",
  prospectus: "หนังสือชี้ชวน",
};

export function pct(v: number, digits = 2): string {
  return `${(v * 100).toFixed(digits)}%`;
}

export function baht(v: number): string {
  return `${Math.round(v).toLocaleString("th-TH")} บาท`;
}

export type RiskLevelTag = "high" | "medium" | "info";
export type SampleRisk = { level: RiskLevelTag; topic: string; detail: string; page: number; source: DocSource };

/** Sample risk alerts for SAMPLE-GLOBAL (real ones come from lib/riskRules.ts). */
export const SAMPLE_RISKS: SampleRisk[] = [
  { level: "high", topic: "ค่าเงิน", detail: "ป้องกันความเสี่ยงค่าเงินตามดุลยพินิจผู้จัดการกองทุน", page: 1, source: "factsheet" },
  { level: "medium", topic: "กระจุกตัว", detail: "10 หลักทรัพย์แรกรวมกัน 62%", page: 3, source: "factsheet" },
  { level: "medium", topic: "ตลาดต่างประเทศ", detail: "ลงทุนในสหรัฐฯ 68%", page: 3, source: "factsheet" },
  { level: "info", topic: "ขายคืน", detail: "ได้รับเงินภายใน 5 วันทำการ (T+5)", page: 9, source: "prospectus" },
];

export const RISK_TAG: Record<RiskLevelTag, { label: string; className: string }> = {
  high: { label: "สูง", className: "bg-danger-soft text-danger-ink border-danger-line" },
  medium: { label: "ปานกลาง", className: "bg-sun-soft text-sun-ink border-sun/60" },
  info: { label: "ควรรู้", className: "bg-sky text-ink-body border-sky-line" },
};

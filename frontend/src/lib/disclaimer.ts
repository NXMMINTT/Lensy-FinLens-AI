/**
 * Fixed wording required by the FinLens Responsible AI rules (project brief).
 * Import these everywhere instead of retyping, so pages and LINE cards always match.
 */

/** Rule 5: shown on every page and every LINE card. */
export const DISCLAIMER = "ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน";

/** Rule 2: shown when a value is not in the source documents. */
export const NOT_FOUND = "ไม่พบข้อมูลนี้ในเอกสาร";
/** A fund figure the documents (or the imported sheet) leave empty, in tables and fund pages. */
export const NOT_IN_DOCS = "ไม่พบในเอกสาร";
/** Where a feeder fund's master fund cost really is (shown when it came from the master fund's own document). */
/** The rebate a Thai feeder fund gets back from its master fund, shown as a minus line. */
export const REBATE_LABEL = "ได้รับคืนจากกองหลัก";
/** A fund that invests directly (not a feeder): there is no master fund cost to look for. */
export const NO_MASTER_NOTE = "กองนี้ลงทุนโดยตรง ไม่มีค่าใช้จ่ายกองหลักซ้อน";
export const MASTER_COST_NOTE = "Factsheet ของกองไทยไม่ได้แสดงค่าใช้จ่ายกองหลัก ต้องไปหาจากเอกสารของกองหลักต่างประเทศ";

/** Rule 7: label for sample (non-real) fund data. */
export const SAMPLE_DATA_LABEL = "ข้อมูลตัวอย่าง";

/**
 * A fund's total yearly cost is an estimate when it adds a master fund expense that the documents do
 * not confirm is outside the TER, or when a rebate from the master fund is not known (never taken as 0
 * on purpose: the team's audit of 10 Nov 2569). Shown next to every such total.
 */
export const ESTIMATE_WORD = "ประมาณ";
export const ESTIMATE_NOTE =
  "ตัวเลขประมาณ: เอกสารไม่ระบุว่า TER รวมค่าใช้จ่ายกองหลักแล้วหรือยัง ระบบจึงบวกให้ และยังไม่ได้หักเงินคืนจากกองหลัก (ถ้ามี) ต้นทุนจริงอาจต่ำกว่านี้";

/** "ต้นทุนต่อปีรวม" or "ต้นทุนต่อปีรวม (ประมาณ)" */
export function totalCostLabel(estimate: boolean): string {
  return estimate ? `ต้นทุนต่อปีรวม (${ESTIMATE_WORD})` : "ต้นทุนต่อปีรวม";
}

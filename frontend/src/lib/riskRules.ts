/**
 * Risk Alert (project brief feature 2): fixed rules, no AI. Each alert cites the document values it
 * comes from (page + source). Alerts describe what the documents say; they never judge whether a
 * fund is good or bad.
 */
import type { DocSource, Fund, Sourced } from "./schema";

export type RiskLevel = "high" | "medium" | "info";
export type RiskTopic = "currency" | "foreign" | "concentration" | "redemption" | "riskLevel";

export type RiskRef = { label: string; page: number; source: DocSource; quote: string | null };

export type RiskAlert = {
  id: string;
  topic: RiskTopic;
  level: RiskLevel;
  title: string;
  detail: string;
  refs: RiskRef[];
};

export const RISK_LEVEL_LABEL: Record<RiskLevel, string> = { high: "สูง", medium: "ปานกลาง", info: "ควรรู้" };
export const RISK_TOPIC_LABEL: Record<RiskTopic, string> = {
  currency: "ค่าเงิน",
  foreign: "ตลาดต่างประเทศ",
  concentration: "การกระจุกตัว",
  redemption: "การขายคืน",
  riskLevel: "ระดับความเสี่ยง",
};

/** Thresholds, in one place so the team can tune them. */
export const RISK_THRESHOLDS = {
  topCountryPct: 50,
  top10MediumPct: 50,
  top10HighPct: 70,
  top5MediumPct: 40,
  topSectorPct: 30,
  settlementMediumDays: 5,
  settlementInfoDays: 3,
  riskLevelInfo: 6,
} as const;

function ref<T>(label: string, s: Sourced<T>): RiskRef[] {
  return s.value !== null && s.page !== null ? [{ label, page: s.page, source: s.source, quote: s.quote }] : [];
}

const ORDER: Record<RiskLevel, number> = { high: 0, medium: 1, info: 2 };

/** An English name between Thai words gets a space on each side ("ลงทุนใน United States 94.8%"); a Thai one stays joined. */
function spaced(name: string): string {
  return /^[A-Za-z0-9]/.test(name) ? ` ${name} ` : `${name} `;
}

export function riskAlerts(f: Fund): RiskAlert[] {
  const T = RISK_THRESHOLDS;
  const out: RiskAlert[] = [];
  const add = (a: RiskAlert) => {
    if (a.refs.length) out.push(a); // rule 1: nothing without a page
  };

  // currency
  const fx = f.risk.fxHedging.value;
  if (fx === "none") {
    add({ id: "fx-none", topic: "currency", level: "high", title: "ไม่ป้องกันความเสี่ยงค่าเงิน", detail: "ถ้าเงินบาทแข็งค่าขึ้น มูลค่าเงินลงทุนเมื่อแปลงกลับเป็นบาทอาจลดลง แม้ราคาสินทรัพย์ในต่างประเทศไม่เปลี่ยน", refs: ref("นโยบายป้องกันค่าเงิน", f.risk.fxHedging) });
  } else if (fx === "discretionary") {
    add({ id: "fx-discretionary", topic: "currency", level: "medium", title: "ป้องกันค่าเงินตามดุลยพินิจผู้จัดการกองทุน", detail: "สัดส่วนการป้องกันเปลี่ยนได้ตามที่ผู้จัดการเห็นสมควร ผลของอัตราแลกเปลี่ยนจึงอาจมากหรือน้อยในแต่ละช่วง", refs: ref("นโยบายป้องกันค่าเงิน", f.risk.fxHedging) });
  } else if (fx === "partial") {
    add({ id: "fx-partial", topic: "currency", level: "medium", title: "ป้องกันค่าเงินบางส่วน", detail: "ส่วนที่ไม่ได้ป้องกันยังได้รับผลจากอัตราแลกเปลี่ยน", refs: ref("นโยบายป้องกันค่าเงิน", f.risk.fxHedging) });
  } else if (fx === "full") {
    add({ id: "fx-full", topic: "currency", level: "info", title: "ป้องกันค่าเงินเกือบทั้งหมด", detail: "การป้องกันความเสี่ยงค่าเงินมีต้นทุน ซึ่งอาจทำให้ผลตอบแทนต่างจากกองทุนหลัก", refs: ref("นโยบายป้องกันค่าเงิน", f.risk.fxHedging) });
  }

  // foreign market
  const country = f.risk.topCountry.value;
  if (country && country.pct >= T.topCountryPct) {
    add({ id: "foreign-country", topic: "foreign", level: "medium", title: `ลงทุนใน${spaced(country.name)}${country.pct}%`, detail: `ผลตอบแทนขึ้นกับตลาด${spaced(country.name)}เป็นหลัก รวมถึงเหตุการณ์และวันหยุดของตลาดนั้น`, refs: ref("ประเทศที่ลงทุน", f.risk.topCountry) });
  }
  if (f.isFeeder.value === true) {
    add({
      id: "foreign-feeder",
      topic: "foreign",
      level: "info",
      title: "ลงทุนผ่านกองทุนหลักในต่างประเทศ (Feeder Fund)",
      detail: f.masterFundName.value ? `เงินส่วนใหญ่ไปลงทุนต่อใน ${f.masterFundName.value} จึงมีค่าใช้จ่ายสองชั้น และผลตอบแทนอาจต่างจากกองทุนหลักเล็กน้อย` : "เงินส่วนใหญ่ไปลงทุนต่อในกองทุนหลัก จึงมีค่าใช้จ่ายสองชั้น",
      refs: [...ref("ประเภทกองทุน", f.isFeeder), ...ref("กองทุนหลัก", f.masterFundName)],
    });
  }

  // concentration
  const top10 = f.risk.top10Pct.value;
  const top5 = f.risk.top5Pct.value;
  if (top10 !== null && top10 >= T.top10MediumPct) {
    add({ id: "conc-top10", topic: "concentration", level: top10 >= T.top10HighPct ? "high" : "medium", title: `10 หลักทรัพย์แรกรวมกัน ${top10}%`, detail: "ถ้าหลักทรัพย์กลุ่มนี้ราคาลง จะกระทบมูลค่ากองมากกว่ากองที่กระจายการลงทุนกว้างกว่า", refs: ref("สัดส่วน 10 อันดับแรก", f.risk.top10Pct) });
  } else if (top5 !== null && top5 >= T.top5MediumPct) {
    add({ id: "conc-top5", topic: "concentration", level: "medium", title: `5 หลักทรัพย์แรกรวมกัน ${top5}%`, detail: "ถ้าหลักทรัพย์กลุ่มนี้ราคาลง จะกระทบมูลค่ากองมากกว่ากองที่กระจายการลงทุนกว้างกว่า", refs: ref("สัดส่วน 5 อันดับแรก", f.risk.top5Pct) });
  }
  const sector = f.risk.topSector.value;
  if (sector && sector.pct >= T.topSectorPct) {
    add({ id: "conc-sector", topic: "concentration", level: "medium", title: `กลุ่ม${spaced(sector.name)}${sector.pct}%`, detail: `มูลค่ากองขึ้นกับอุตสาหกรรม${spaced(sector.name)}ค่อนข้างมาก`, refs: ref("อุตสาหกรรมที่ลงทุน", f.risk.topSector) });
  }

  // redemption
  const days = f.redemption.settlementDays.value;
  if (days !== null && days >= T.settlementInfoDays) {
    add({ id: "redeem-days", topic: "redemption", level: days >= T.settlementMediumDays ? "medium" : "info", title: `ได้รับเงินหลังขายคืน ${days} วันทำการ (T+${days})`, detail: "ถ้าต้องใช้เงินด่วน ควรเผื่อเวลารอเงินเข้าบัญชี และวันหยุดของตลาดต่างประเทศอาจทำให้ช้ากว่านี้", refs: ref("ระยะเวลารับเงินค่าขายคืน", f.redemption.settlementDays) });
  }
  if (f.redemption.lockUp.value) {
    add({ id: "redeem-lockup", topic: "redemption", level: "medium", title: "มีเงื่อนไขการขายคืน", detail: f.redemption.lockUp.value, refs: ref("เงื่อนไขการขายคืน", f.redemption.lockUp) });
  }

  // risk level as stated by the document
  const level = f.riskLevel.value;
  if (level !== null && level >= T.riskLevelInfo) {
    add({ id: "risk-level", topic: "riskLevel", level: "info", title: `เอกสารระบุระดับความเสี่ยง ${level} จาก 8`, detail: "ระดับที่ บลจ. จัดไว้ตามเกณฑ์ ก.ล.ต. ยิ่งตัวเลขสูง มูลค่ายิ่งขึ้นลงได้มาก", refs: ref("ระดับความเสี่ยง", f.riskLevel) });
  }

  return out.sort((a, b) => ORDER[a.level] - ORDER[b.level]);
}

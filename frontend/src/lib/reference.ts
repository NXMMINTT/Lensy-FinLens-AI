/**
 * Investment reference table (round 1): 123 investment types in 10 groups, each with the latest
 * figures found, their dates, risks, how to check yourself, sources and a verification status.
 * reference-data.json is converted from the team's workbook FinLens_Investment_Reference.xlsx
 * (figures read from search results on 9 Nov 2569, not yet from every full source page).
 * General knowledge, not figures the app checked page by page, and not investment advice.
 */
import data from "./reference-data.json";

import { refPath, REF_STATUS_LABEL, shortAsOf, type RefCardData, type RefCompareData, type RefStatus } from "./referenceShared";
import type { Fund } from "./schema";

export * from "./referenceShared";
export type RefSource = { key: string; name: string; url: string | null; tier: string };
export type RefItem = {
  id: string;
  /** The one figure shown on the card, picked from this topic's own facts; null when there is none. */
  headline: { value: string; label: string } | null;
  title: string;
  what: string;
  facts: string[];
  asOf: string;
  risk: string;
  check: string[];
  sources: RefSource[];
  status: RefStatus;
  note: string;
};
export type RefCategory = { id: string; num: number; title: string; items: RefItem[] };

export const REFERENCE: RefCategory[] = data.categories as RefCategory[];
export const REFERENCE_ACCESSED = "9 พ.ย. 2569";
export const REFERENCE_COUNT = REFERENCE.reduce((n, c) => n + c.items.length, 0);

const BY_ID = new Map(REFERENCE.flatMap((c) => c.items.map((it) => [it.id, it] as const)));

export function refItem(id: string): RefItem | undefined {
  return BY_ID.get(id);
}

export function refFromSlug(slug: string): RefItem | undefined {
  return BY_ID.get(slug.replace("-", "."));
}

export function refCategory(id: string): RefCategory | undefined {
  return REFERENCE.find((c) => c.items.some((i) => i.id === id));
}

/** Where a topic opens: its own page, or its line on /explain when nothing has been checked yet. */
export function refHref(id: string): string {
  const it = BY_ID.get(id);
  return refPath(id, it?.status ?? "unchecked");
}

/** The slim card data (what the client list needs), so the full texts stay on the server. */
export function toRefCard(it: RefItem): RefCardData {
  return {
    id: it.id,
    cat: Number(it.id.split(".")[0]),
    title: it.title,
    status: it.status,
    headline: it.headline,
    summary: it.facts[0] ?? it.what,
    asOf: it.asOf,
  };
}

/** The data one column of the topic comparison needs. */
export function toRefCompare(it: RefItem): RefCompareData {
  return { ...toRefCard(it), what: it.what, facts: it.facts, risk: it.risk, note: it.note, sourceCount: it.sources.length };
}

/** Rules from what the fund's own data says (type text, feeder flag, risk level) to reference topics. */
const RULES: { test: (text: string, f: Fund) => boolean; ids: string[] }[] = [
  { test: (t) => /ตลาดเงิน/.test(t), ids: ["1.6"] },
  { test: (t) => /ตราสารหนี้/.test(t), ids: ["2.11"] },
  { test: (t) => /ผสม/.test(t), ids: ["4.4"] },
  { test: (t) => /ตราสารทุน|หุ้น/.test(t) && !/ผสม|โลหะ|ทองคำ/.test(t), ids: ["4.3"] },
  { test: (t) => /passive|พาสซีฟ|ดัชนี|index/i.test(t), ids: ["4.5"] },
  { test: (t) => /active/i.test(t), ids: ["4.6"] },
  { test: (_t, f) => f.isFeeder.value === true, ids: ["4.9", "11.3"] },
  { test: (t) => /ทองคำ/.test(t), ids: ["4.14", "5.3", "7.1"] },
  { test: (t) => /thai ?esg/i.test(t), ids: ["4.17", "4.15"] },
  { test: (t) => /\brmf\b|เลี้ยงชีพ/i.test(t), ids: ["4.16"] },
  { test: (t) => /\bssf\b|เพื่อการออม/i.test(t), ids: ["4.18"] },
  { test: (t) => /หุ้นไทย|set50/i.test(t), ids: ["3.1"] },
  { test: (t) => /ปันผล/.test(t), ids: ["3.3"] },
  { test: (t) => /สหรัฐ|ยูเอส|\bus\b|s&p ?500|nasdaq/i.test(t), ids: ["3.11"] },
  { test: (t) => /จีน|ญี่ปุ่น|อินเดีย|เวียดนาม|ยุโรป/.test(t), ids: ["3.12"] },
  { test: (t) => /เทคโนโลยี|เซมิคอนดักเตอร์|semiconductor/i.test(t), ids: ["3.13"] },
  { test: (_t, f) => (f.riskLevel.value ?? 0) >= 7, ids: ["4.19"] },
  { test: (t, f) => f.isFeeder.value === true && !/ป้องกันค่าเงิน|hedg/i.test(t), ids: ["10.2"] },
];

/** Reference topics that match one fund, in rule order, without duplicates. Sample funds get none. */
export function referenceForFund(f: Fund): RefItem[] {
  if (f.meta.isSample) return [];
  const text = [f.code, f.nameTh.value, f.type.value, f.masterFundName.value].filter(Boolean).join(" ");
  const ids = RULES.filter((r) => r.test(text, f)).flatMap((r) => r.ids);
  return [...new Set(ids)].map((id) => BY_ID.get(id)).filter((x): x is RefItem => x !== undefined);
}

/** One topic's figures for the chat model and the number check, with its date, status and sources. */
export function topicFacts(t: RefItem): { text: string; note: string } {
  const lines = [`## หัวข้อ ${t.id}: ${t.title} | ข้อมูล ณ ${t.asOf || "ไม่ระบุ"} | สถานะ: ${REF_STATUS_LABEL[t.status]}`];
  if (t.what) lines.push(`- คืออะไร: ${t.what}`);
  for (const f of t.facts) lines.push(`- ${f}`);
  if (t.risk) lines.push(`- ความเสี่ยง: ${t.risk}`);
  if (t.note) lines.push(`- หมายเหตุ: ${t.note}`);
  if (t.sources.length) lines.push(`- แหล่งที่มา: ${t.sources.map((s) => s.name).join("; ")}`);
  return {
    text: lines.join("\n"),
    note: `ข้อมูล${t.title} จากตารางอ้างอิงของ FinLens ณ ${shortAsOf(t.asOf) || "ไม่ระบุวันที่"} (${REF_STATUS_LABEL[t.status]}) ตรวจกับแหล่งที่มาก่อนใช้`,
  };
}

/** Everyday words people type for a topic (Thai spellings, short names). Checked topics only. */
const TOPIC_ALIAS: Record<string, string> = {
  ราคาทอง: "7.1",
  ทองคำ: "7.1",
  ทองแท่ง: "7.1",
  บิตคอยน์: "9.1",
  บิทคอยน์: "9.1",
  อีเธอเรียม: "9.2",
  ดอลลาร์: "10.2",
  ค่าเงินบาท: "10.2",
  ยูโร: "10.3",
  เงินเยน: "10.5",
  น้ำมัน: "7.8",
  หุ้นกู้: "2.4",
  ฝากประจำ: "1.2",
  ออมทรัพย์: "1.1",
  ดอกเบี้ยนโยบาย: "1.1",
  "REIT": "4.11",
};

/** The names a topic goes by: its Thai and English parts ("เงินฝากออมทรัพย์", "Savings Account"). */
function topicNames(t: RefItem): string[] {
  return t.title
    .split(/\s*[()\/–]\s*|\s+-\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3 && !/^ข้อมูล|^หมวด/.test(s));
}

/**
 * Checked topics named in a message (LINE, chat), longest match first. A match inside a longer one
 * is dropped ("พันธบัตรออมทรัพย์" is the bond, not "ออมทรัพย์" the deposit); two topics with the
 * same name keep the first (the one with the figures, e.g. 1.6 over its pointer 4.1).
 */
export function topicsInText(text: string, max = 3): RefItem[] {
  const lower = text.toLowerCase();
  const found: { t: RefItem; name: string; at: number }[] = [];
  const seen = new Set<string>();
  const add = (t: RefItem | undefined, name: string) => {
    if (!t || t.status === "unchecked") return;
    const n = name.toLowerCase();
    // an English name must be a whole word ("DR" not inside "ADDRESS"); a Thai one is found anywhere
    const at = /^[a-z0-9 &.-]+$/i.test(name) ? lower.search(new RegExp(`(^|[^a-z0-9])${escapeRe(n)}(?![a-z0-9])`)) : lower.indexOf(n);
    if (at < 0 || seen.has(t.id)) return;
    found.push({ t, name: n, at });
  };
  for (const c of REFERENCE) for (const t of c.items) for (const name of topicNames(t)) add(t, name);
  for (const [word, id] of Object.entries(TOPIC_ALIAS)) add(BY_ID.get(id), word);
  // longest name first; skip one that sits inside a longer match, a topic already taken, or the same name twice
  found.sort((a, b) => b.name.length - a.name.length);
  const out: RefItem[] = [];
  const taken: { name: string; at: number }[] = [];
  const names = new Set<string>();
  for (const f of found) {
    if (out.some((t) => t.id === f.t.id) || names.has(f.name)) continue;
    if (taken.some((x) => x.name.includes(f.name) && f.at >= x.at && f.at < x.at + x.name.length)) continue;
    out.push(f.t);
    taken.push(f);
    names.add(f.name);
    if (out.length >= max) break;
  }
  return out;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

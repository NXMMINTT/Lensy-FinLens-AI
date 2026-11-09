import { describe, expect, it } from "vitest";

import { getVerifiedFunds } from "./funds";
import { RATE_ITEMS } from "./rateCalc";
import { REFERENCE, REFERENCE_COUNT, refItem, referenceForFund, REF_STATUS_LABEL } from "./reference";

const items = REFERENCE.flatMap((c) => c.items);

describe("investment reference (round 1)", () => {
  it("has 10 groups and 123 topics with unique ids", () => {
    expect(REFERENCE).toHaveLength(10);
    expect(REFERENCE_COUNT).toBe(123);
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it("gives every topic a known status, and every source link is https", () => {
    for (const it of items) {
      expect(Object.keys(REF_STATUS_LABEL), it.id).toContain(it.status);
      for (const s of it.sources) if (s.url) expect(s.url, it.id).toMatch(/^https:\/\//);
    }
  });

  it("keeps no workbook wording (sheets, columns, 'your file', upload paths)", () => {
    for (const it of items) {
      const text = JSON.stringify({ ...it, sources: it.sources.map((s) => s.name) });
      expect(text, it.id).not.toMatch(/ชีต \d|ในชีต|คอลัมน์|ของฉัน|ไฟล์ของคุณ|ผู้ใช้|funds20|\/mnt\//);
    }
  });

  it("points every 'ดูหัวข้อ x.y' at a topic that exists", () => {
    for (const it of items) {
      for (const m of JSON.stringify(it).matchAll(/ดู(?:หัวข้อ)? (\d+\.\d+)/g)) expect(refItem(m[1]), `${it.id} -> ${m[1]}`).toBeDefined();
    }
  });

  it("shows a card figure only when its numbers appear in the topic's own text", () => {
    for (const it of items) {
      if (!it.headline) continue;
      const text = [it.what, ...it.facts].join(" ").replace(/,/g, "");
      for (const n of it.headline.value.replace(/,/g, "").match(/\d+(?:\.\d+)?/g) ?? []) expect(text, `${it.id} ${n}`).toContain(n);
    }
  });

  it("takes every calculator rate from its topic's own text, in that topic's group", () => {
    for (const r of RATE_ITEMS) {
      const t = refItem(r.topic);
      expect(t, r.topic).toBeDefined();
      expect(Number(r.topic.split(".")[0]), r.label).toBe(r.group);
      const text = [t!.what, ...t!.facts].join(" ");
      expect(text, `${r.label} ${r.ratePct}`).toMatch(new RegExp(`\\b${r.ratePct.toFixed(2).replace(".", "\\.")}%|\\b${String(r.ratePct).replace(".", "\\.")}%`));
    }
  });

  it("finds related topics for every real fund, and none for sample data", () => {
    for (const f of getVerifiedFunds()) {
      const ids = referenceForFund(f).map((r) => r.id);
      if (f.meta.isSample) expect(ids, f.code).toEqual([]);
      else expect(ids.length, f.code).toBeGreaterThan(0);
    }
    const gold = getVerifiedFunds().find((f) => f.code === "SCBGOLDH");
    if (gold) expect(referenceForFund(gold).map((r) => r.id)).toEqual(expect.arrayContaining(["4.14", "4.9", "4.19"]));
  });
});

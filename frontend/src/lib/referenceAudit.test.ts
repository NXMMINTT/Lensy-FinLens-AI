import { describe, expect, it } from "vitest";

import { getVerifiedFunds, annualCostIsEstimate } from "./funds";
import { RATE_ITEMS } from "./rateCalc";
import { REFERENCE, refItem, shownFacts, shownNote, toRefCard, toRefCompare, topicFacts } from "./reference";

const items = REFERENCE.flatMap((c) => c.items);

describe("the team's audit of 10 Nov 2569", () => {
  it("records for every topic whether its figures may be shown, the rule, the law and the date", () => {
    for (const it of items) {
      expect(typeof it.showFigures, it.id).toBe("boolean");
      expect(it.figuresRule, it.id).toMatch(/^(ได้|ไม่ได้)/);
      expect(it.showFigures, it.id).toBe(it.figuresRule.startsWith("ได้"));
      expect(it.law, it.id).not.toBe("");
      expect(it.checkedOn, it.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("never shows a held-back figure: no headline, no numbered fact, no numbered note", () => {
    const held = items.filter((it) => !it.showFigures);
    expect(held.length).toBeGreaterThan(0);
    for (const it of held) {
      expect(toRefCard(it).headline, it.id).toBeNull();
      for (const f of shownFacts(it)) expect(f, it.id).not.toMatch(/\d/);
      expect(shownNote(it), it.id).not.toMatch(/\d/);
      expect(toRefCompare(it).facts, it.id).toEqual(shownFacts(it));
    }
  });

  it("sends the chat model no held-back fact line", () => {
    for (const it of items.filter((x) => !x.showFigures)) {
      const lines = topicFacts(it).text.split("\n");
      for (const f of it.facts.filter((x) => /\d/.test(x))) expect(lines, it.id).not.toContain(`- ${f}`);
    }
  });

  it("gives a headline to every topic whose figures may be shown, taken from its own facts", () => {
    for (const it of items.filter((x) => x.showFigures)) {
      expect(it.headline, it.id).not.toBeNull();
      expect([it.what, ...it.facts].join(" "), it.id).toContain(it.headline!.value);
    }
  });

  it("offers a preset calculator rate only from a topic whose figures may be shown", () => {
    const shown = RATE_ITEMS.filter((r) => refItem(r.topic)?.showFigures);
    for (const r of shown) expect(refItem(r.topic)!.showFigures, r.topic).toBe(true);
  });

  it("calls a feeder fund's total an estimate unless the documents settle both the TER and the rebate", () => {
    for (const f of getVerifiedFunds()) {
      const settled = f.fees.masterFundExpense.value === null || f.fees.terIncludesMasterFund.value === true || (f.fees.terIncludesMasterFund.value === false && f.fees.rebate.value !== null);
      expect(annualCostIsEstimate(f), f.code).toBe(!settled);
    }
    // the demo funds: both real feeders, neither document says whether the TER includes the master fund
    expect(annualCostIsEstimate(getVerifiedFunds().find((f) => f.code === "KFUS-A")!)).toBe(true);
  });
});

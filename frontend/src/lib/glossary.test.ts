import { describe, expect, it } from "vitest";

import { GLOSSARY } from "./glossary";

const terms = GLOSSARY.flatMap((g) => g.terms);

describe("glossary", () => {
  it("has unique ids (they are page anchors)", () => {
    expect(new Set(terms.map((t) => t.id)).size).toBe(terms.length);
  });

  it("contains no fund figures: no percentages or baht amounts", () => {
    for (const t of terms) {
      const all = `${t.text} ${t.tip ?? ""}`;
      expect(all, t.id).not.toMatch(/\d\s*%|\d[\d,]*\s*บาท/);
    }
  });

  it("keeps the anchors the checklist links to", () => {
    for (const id of ["master-expense", "fx-hedge", "settlement", "risk-level"]) expect(terms.some((t) => t.id === id), id).toBe(true);
  });
});

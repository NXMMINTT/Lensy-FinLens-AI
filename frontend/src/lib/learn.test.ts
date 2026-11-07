import { describe, expect, it } from "vitest";

import { LEARN, LEARN_COUNT } from "./learn";

const items = LEARN.flatMap((g) => g.items);

describe("learn (130 questions)", () => {
  it("numbers the questions 1..130 in order (they are page anchors #q1..#q130)", () => {
    expect(LEARN_COUNT).toBe(130);
    expect(items.map((it) => it.n)).toEqual(Array.from({ length: 130 }, (_, i) => i + 1));
  });

  it("has unique group ids and a title for every group", () => {
    expect(new Set(LEARN.map((g) => g.id)).size).toBe(LEARN.length);
    for (const g of LEARN) expect(g.title.length, g.id).toBeGreaterThan(0);
  });

  it("keeps no leftover markup from the source chat (tags, citations, LaTeX)", () => {
    for (const it of items) {
      expect(it.body, `q${it.n}`).not.toMatch(/<[A-Za-z/]|turn\d+search|\\[[(]/);
      expect(it.body.trim().length, `q${it.n}`).toBeGreaterThan(0);
    }
  });
});

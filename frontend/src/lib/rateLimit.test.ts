import { describe, expect, it } from "vitest";

import { allowAsk, ASK_LIMIT } from "./rateLimit";

describe("allowAsk", () => {
  it("stops a burst from one person, not from others, and lets them ask again later", () => {
    const t = 1_000_000;
    for (let i = 0; i < ASK_LIMIT.max; i++) expect(allowAsk("a", t + i)).toBe(true);
    expect(allowAsk("a", t + 100)).toBe(false);
    expect(allowAsk("b", t + 100)).toBe(true);
    expect(allowAsk("a", t + ASK_LIMIT.windowMs + 50)).toBe(true);
  });
});

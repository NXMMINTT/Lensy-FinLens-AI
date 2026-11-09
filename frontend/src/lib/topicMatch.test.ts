import { describe, expect, it } from "vitest";

import { topicsInText } from "./reference";

describe("topicsInText: everyday words", () => {
  it("finds gold bars from 'ทองคำ', and the gold fund topic from its full name", () => {
    expect(topicsInText("ทองคำตอนนี้บาทละเท่าไหร่").map((t) => t.id)).toEqual(["7.1"]);
    expect(topicsInText("กองทุนรวมทองคำคืออะไร").map((t) => t.id)[0]).toBe("4.14");
  });
});

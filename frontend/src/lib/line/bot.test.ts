import { afterEach, describe, expect, it, vi } from "vitest";

import { moneyAnswer, refusal, type AskResponse } from "../ask";
import { DISCLAIMER, SAMPLE_DATA_LABEL } from "../disclaimer";
import { getVerifiedFunds } from "../funds";
import type { Fund } from "../schema";
import { handleText, matchFunds, MENU, welcome } from "./bot";
import { answerCard, appUrl, fundCard } from "./flex";

const funds = getVerifiedFunds();
const calls: { codes: string[]; question: string }[] = [];
const ask = async (fs: Fund[], q: string): Promise<AskResponse> => {
  calls.push({ codes: fs.map((f) => f.code), question: q });
  return { kind: "ai", answer: "ตอบทดสอบค่ะ", refs: [] };
};
const json = (x: unknown) => JSON.stringify(x);

afterEach(() => {
  calls.length = 0;
  vi.unstubAllEnvs();
});

describe("matchFunds", () => {
  it("finds funds by code (any case) or Thai name", () => {
    expect(matchFunds("sample-global", funds).map((f) => f.code)).toEqual(["SAMPLE-GLOBAL"]);
    expect(matchFunds("กองทุนตัวอย่าง ดัชนีโลก", funds).map((f) => f.code)).toEqual(["SAMPLE-INDEX"]);
    expect(matchFunds("สวัสดี", funds)).toEqual([]);
  });
});

describe("handleText", () => {
  it("greets with fund chips and the disclaimer line", async () => {
    const m = await handleText("สวัสดีค่ะ", funds, ask);
    expect(json(m)).toContain("ไม่ใช่คำแนะนำการลงทุน");
    expect(json(m)).toContain("SAMPLE-GLOBAL");
  });

  it("sends a summary card when the message is just a fund code or name", async () => {
    const [card] = await handleText("SAMPLE-GLOBAL", funds, ask);
    expect(card.type).toBe("flex");
    expect(json(card)).toContain("1.87%");
    expect(calls).toHaveLength(0);
  });

  it("asks about the named fund with the fund name taken out of the question", async () => {
    await handleText("SAMPLE-INDEX ลงทุน 100,000 บาท 5 ปี เสียกี่บาท", funds, ask);
    expect(calls).toEqual([{ codes: ["SAMPLE-INDEX"], question: "ลงทุน 100,000 บาท 5 ปี เสียกี่บาท" }]);
  });

  it("refuses advice even without a fund name", async () => {
    await handleText("ควรซื้อกองไหนดี", funds, ask);
    expect(calls[0].question).toBe("ควรซื้อกองไหนดี");
  });

  it("asks which fund when a general question names none", async () => {
    const [m] = await handleText("TER คืออะไร", funds, ask);
    expect(calls).toHaveLength(0);
    expect(json(m)).toContain("SAMPLE-GLOBAL TER คืออะไร");
  });

  it("handles the rich menu words", async () => {
    expect(json(await handleText(MENU.fees, funds, ask))).toContain("กองไหน");
    expect(json(await handleText(MENU.calc, funds, ask))).toContain("ลงทุน 100,000 บาท 10 ปี");
    expect(json(await handleText(MENU.ask, funds, ask))).toContain("SAMPLE-GLOBAL");
  });
});

describe("flex cards", () => {
  it("fund card: total cost with pages, hidden-fee warning, risks, sample label, disclaimer", () => {
    const s = json(fundCard(funds.find((f) => f.code === "SAMPLE-GLOBAL")!));
    expect(s).toContain("1.87%");
    expect(s).toContain("หน้า 14 · หนังสือชี้ชวน");
    expect(s).toContain("ไม่อยู่ใน Factsheet");
    expect(s).toContain(SAMPLE_DATA_LABEL);
    expect(s).toContain(DISCLAIMER);
  });

  it("answer card keeps the refusal, assumptions and the disclaimer", () => {
    expect(json(answerCard(refusal(), []))).toContain(DISCLAIMER);
    const money = moneyAnswer(funds.slice(0, 1), "ลงทุน 100,000 บาท 10 ปี เสียกี่บาท");
    const s = json(answerCard(money, ["SAMPLE-GLOBAL"]));
    expect(s).toContain("ไม่ใช่การคาดการณ์");
    expect(s).toContain("หน้า 14");
  });

  it("links open inside LINE through LIFF when it is set", () => {
    vi.stubEnv("NEXT_PUBLIC_LIFF_ID", "123-abc");
    expect(appUrl("/funds/X")).toBe("https://liff.line.me/123-abc/funds/X");
    vi.stubEnv("NEXT_PUBLIC_LIFF_ID", "");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://finlens.example/");
    expect(appUrl("/funds/X")).toBe("https://finlens.example/funds/X");
  });

  it("uses no emoji (cards look the same on every phone)", () => {
    const s = json([...welcome(funds), ...funds.map(fundCard)]);
    expect(s).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });
});

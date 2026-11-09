import { afterEach, describe, expect, it, vi } from "vitest";

import { EXAMPLE_QUESTIONS, moneyAnswer, refusal, type AskResponse } from "../ask";
import { DISCLAIMER, MASTER_COST_NOTE, SAMPLE_DATA_LABEL } from "../disclaimer";
import { getVerifiedFunds } from "../funds";
import type { RefItem } from "../reference";
import type { Fund } from "../schema";
import { handleText, matchFunds, MENU, welcome } from "./bot";
import { answerCard, appUrl, fundCard } from "./flex";

const funds = getVerifiedFunds();
const calls: { codes: string[]; question: string; topics?: string[] }[] = [];
const ask = async (fs: Fund[], q: string, topics?: RefItem[]): Promise<AskResponse> => {
  calls.push({ codes: fs.map((f) => f.code), question: q, ...(topics?.length ? { topics: topics.map((t) => t.id) } : {}) });
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
  it("greets with the example questions, the featured real funds first, and the disclaimer line", async () => {
    const s = json(await handleText("สวัสดีค่ะ", funds, ask));
    expect(s).toContain("ไม่ใช่คำแนะนำการลงทุน");
    for (const q of EXAMPLE_QUESTIONS) expect(s).toContain(q.short);
    expect(s.indexOf('"label":"B-INNOTECH"')).toBeLessThan(s.indexOf('"label":"K-US500X-A(A)"'));
    expect(s).not.toContain("SAMPLE-GLOBAL"); // sample funds are last, past the buttons
  });

  it("sends both cards for \"เทียบ A กับ B\" and \"A กับ B\"", async () => {
    for (const q of ["B-INNOTECH กับ K-US500X-A(A)", "เทียบ B-INNOTECH กับ K-US500X-A(A)"]) {
      const m = await handleText(q, funds, ask);
      expect(m.map((x) => x.type)).toEqual(["flex", "flex"]);
      expect(json(m)).toContain("2.272%");
    }
    expect(calls).toHaveLength(0);
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

  it("answers a general question with no fund as general knowledge, and offers fund chips", async () => {
    const [m] = await handleText("TER คืออะไร", funds, ask);
    expect(calls).toEqual([{ codes: [], question: "TER คืออะไร" }]);
    expect(json(m)).toContain("ตอบทดสอบค่ะ");
    expect(json(m)).toContain("B-INNOTECH TER คืออะไร");
  });

  it("answers about other investments named in the message from the reference topics", async () => {
    const [m] = await handleText("พันธบัตรออมพลัส ดอกเบี้ยเท่าไหร่", funds, ask);
    expect(calls).toEqual([{ codes: [], question: "พันธบัตรออมพลัส ดอกเบี้ยเท่าไหร่", topics: ["2.3"] }]);
    expect(json(m)).toContain("ตอบทดสอบค่ะ");
  });

  it("asks about a fund and a topic together", async () => {
    await handleText("SAMPLE-INDEX กับ ทองคำแท่ง ต่างกันยังไง", funds, ask);
    expect(calls[0].codes).toEqual(["SAMPLE-INDEX"]);
    expect(calls[0].topics).toEqual(["7.1"]);
  });

  it("keeps the welcome quick replies within LINE's 13", () => {
    const [m] = welcome(funds);
    const items = (m as { quickReply?: { items: unknown[] } }).quickReply?.items ?? [];
    expect(items.length).toBeLessThanOrEqual(13);
    expect(json(m)).toContain(MENU.ask);
  });

  it("handles the rich menu words", async () => {
    expect(json(await handleText(MENU.fees, funds, ask))).toContain("กองไหน");
    expect(json(await handleText(MENU.calc, funds, ask))).toContain("ลงทุน 100,000 บาท 10 ปี");
    const ask4 = json(await handleText(MENU.ask, funds, ask));
    for (const q of EXAMPLE_QUESTIONS) expect(ask4).toContain(q.short);
  });
});

describe("flex cards", () => {
  it("fund card: total cost with pages, hidden-fee warning, risks, sample label, disclaimer", () => {
    const s = json(fundCard(funds.find((f) => f.code === "SAMPLE-GLOBAL")!));
    expect(s).toContain("1.87%");
    expect(s).toContain("หน้า 14 · หนังสือชี้ชวน");
    expect(s).toContain(MASTER_COST_NOTE);
    expect(s).toContain(SAMPLE_DATA_LABEL);
    expect(s).toContain(DISCLAIMER);
  });

  it("answer card keeps the refusal, assumptions and the disclaimer", () => {
    expect(json(answerCard(refusal(), []))).toContain(DISCLAIMER);
    const money = moneyAnswer(funds.filter((f) => f.code === "SAMPLE-GLOBAL"), "ลงทุน 100,000 บาท 10 ปี เสียกี่บาท");
    const s = json(answerCard(money, ["SAMPLE-GLOBAL"]));
    expect(s).toContain("ไม่ใช่การคาดการณ์");
    expect(s).toContain("หน้า 14");
  });

  it("fund card for SEC data says where each figure came from (no empty text)", () => {
    const card = fundCard(funds.find((f) => f.code === "SCBMONEY(A)")!);
    const s = json(card);
    expect(s).toContain("ข้อมูลจาก ก.ล.ต.");
    expect(s).not.toContain('"text":""');
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

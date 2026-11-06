import fs from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { checkTaxAnswer, isTaxQuestion, TAX_KNOWLEDGE_NOTE, TAX_NOT_IN_TEXT, TAX_NOTE, TAX_SYSTEM, taxKnowledgeForModel } from "./ask";

const FILE = path.join(process.cwd(), "data", "knowledge", "tax-funds.md");
const raw = fs.readFileSync(FILE, "utf8");
const knowledge = taxKnowledgeForModel(raw);

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.doUnmock("./ai");
});

describe("data/knowledge/tax-funds.md", () => {
  it("covers RMF, SSF and Thai ESG, with TODO items for the team", () => {
    for (const h of ["RMF (กองทุนรวมเพื่อการเลี้ยงชีพ)", "SSF (กองทุนรวมเพื่อการออม)", "Thai ESG (กองทุนรวมไทยเพื่อความยั่งยืน)"]) expect(raw).toContain(h);
    expect(raw).toContain("TODO");
  });

  it("never sends TODO lines, the team's TODO checklist or the file header to the model", () => {
    expect(knowledge).not.toContain("TODO");
    expect(knowledge).not.toContain("ยืนยันเงื่อนไข Thai ESG ที่ซื้อตั้งแต่ปี 2570"); // checklist item under "## TODO …"
    expect(knowledge).not.toContain("ให้ AI สรุปจากไฟล์นี้เท่านั้น"); // header
    expect(knowledge).toContain("กองทุนรวมเพื่อการเลี้ยงชีพ");
    expect(knowledge).toContain("300,000 บาท");
  });
});

describe("tax questions", () => {
  it("are recognised", () => {
    for (const q of ["RMF กับ Thai ESG ต่างกันยังไง", "SSF ยังลดหย่อนได้ไหม", "ซื้อกองไหนลดหย่อนภาษีได้"]) expect(isTaxQuestion(q)).toBe(true);
    for (const q of ["TER คืออะไร", "กองนี้มีค่าใช้จ่ายอะไรที่ควรระวัง?"]) expect(isTaxQuestion(q)).toBe(false);
  });

  it("end with the tax-year line and say they come from the standard text", () => {
    const r = checkTaxAnswer({ answer: "RMF เป็นกองทุนเพื่อการเลี้ยงชีพค่ะ" }, knowledge, "RMF คืออะไร");
    expect(r.answer.endsWith(TAX_NOTE)).toBe(true);
    expect(r.answer).toContain("เงื่อนไขอาจเปลี่ยนตามปีภาษี");
    expect(r.note).toBe(TAX_KNOWLEDGE_NOTE);
  });

  it("drop an answer that states conditions not in the standard text (e.g. a made-up cap)", () => {
    const r = checkTaxAnswer({ answer: "RMF ลดหย่อนได้สูงสุด 750,000 บาท ถือ 7 ปีค่ะ" }, knowledge, "RMF ลดหย่อนได้เท่าไร");
    expect(r.answer.startsWith(TAX_NOT_IN_TEXT)).toBe(true);
    expect(r.answer.endsWith(TAX_NOTE)).toBe(true);
  });

  it("are sent to the model with the standard text only, not the fund prompt", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    const chatJson = vi.fn().mockResolvedValue({ data: { answer: "Thai ESG ลงทุนในหลักทรัพย์ไทยที่ใส่ใจ ESG ค่ะ" }, model: "m" });
    vi.doMock("./ai", async (orig) => ({ ...(await orig<typeof import("./ai")>()), chatJson }));
    const { answerQuestion } = await import("./askService");
    const r = await answerQuestion([], "Thai ESG คืออะไร");
    expect(chatJson).toHaveBeenCalledOnce();
    expect(chatJson.mock.calls[0][0]).toBe(TAX_SYSTEM);
    expect(chatJson.mock.calls[0][1]).toContain("กองทุนรวมไทยเพื่อความยั่งยืน");
    expect(chatJson.mock.calls[0][1]).not.toContain("TODO");
    expect(r.answer).toContain(TAX_NOTE);
  });
});

describe("tax-year line", () => {
  it("appears once even when the model says it too", () => {
    const r = checkTaxAnswer({ answer: "RMF เป็นกองทุนเพื่อการเลี้ยงชีพค่ะ ทั้งนี้เงื่อนไขอาจเปลี่ยนตามปีภาษีค่ะ" }, knowledge, "RMF คืออะไร");
    expect(r.answer.match(/เงื่อนไขอาจเปลี่ยนตามปีภาษี/g)).toHaveLength(1);
    expect(r.answer.endsWith(TAX_NOTE)).toBe(true);
  });
});

describe("tax answers with real conditions", () => {
  it("keep numbers that are in the standard text", () => {
    const r = checkTaxAnswer({ answer: "Thai ESG ลดหย่อนได้ไม่เกิน 30% ของเงินได้ และไม่เกิน 300,000 บาทค่ะ" }, knowledge, "Thai ESG ลดหย่อนได้เท่าไร");
    expect(r.answer).toContain("300,000 บาท");
    expect(r.answer.endsWith(TAX_NOTE)).toBe(true);
  });
});

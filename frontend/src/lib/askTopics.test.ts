import { describe, expect, it } from "vitest";

import { askPrompt, AskRequestSchema, checkAiAnswer, NEED_FUND_FOR_MONEY, NOT_IN_FACTS } from "./ask";
import { answerQuestion } from "./askService";
import { getFund, getVerifiedFunds } from "./funds";
import { refItem, topicFacts } from "./reference";
import { subjectsInQuestion } from "./subjects";

const saving = refItem("1.1")!;

describe("chat about investment reference topics", () => {
  it("takes topics, funds, both, or just a question (the question says what it is about)", () => {
    expect(AskRequestSchema.safeParse({ topicIds: ["1.1"], question: "ดอกเบี้ยเท่าไหร่" }).success).toBe(true);
    expect(AskRequestSchema.safeParse({ fundCodes: ["B-INNOTECH"], question: "TER เท่าไหร่" }).success).toBe(true);
    expect(AskRequestSchema.safeParse({ question: "ออมพลัสดอกเบี้ยเท่าไหร่" }).success).toBe(true);
    expect(AskRequestSchema.safeParse({ topicIds: ["abc"], question: "ดอกเบี้ยเท่าไหร่" }).success).toBe(false);
  });

  it("reads funds and topics from the question, chosen ones first", () => {
    const all = getVerifiedFunds();
    const a = subjectsInQuestion("พันธบัตรออมพลัส ดอกเบี้ยเท่าไหร่", all);
    expect(a.funds).toEqual([]);
    expect(a.topics.map((t) => t.id)).toEqual(["2.3"]);
    const b = subjectsInQuestion("K-US500X-A(A) กับ ทองคำแท่ง ต่างกันยังไง", all);
    expect(b.funds.map((f) => f.code)).toEqual(["K-US500X-A(A)"]);
    expect(b.topics.map((t) => t.id)).toEqual(["7.1"]);
    const c = subjectsInQuestion("TER คืออะไร", all, [getFund("B-INNOTECH")!]);
    expect(c.funds.map((f) => f.code)).toEqual(["B-INNOTECH"]);
    expect(c.topics).toEqual([]);
  });

  it("asks for a fund when a baht question names none", async () => {
    const r = await answerQuestion([], "ลงทุน 100,000 บาท 10 ปี เสียค่าธรรมเนียมกี่บาท");
    expect(r.answer).toBe(NEED_FUND_FOR_MONEY);
  });

  it("gives the model the topic's figures with its date and status", () => {
    const facts = topicFacts(saving);
    expect(facts.text).toContain("1.35%");
    expect(facts.text).toContain(saving.asOf);
    expect(facts.note).toContain("ตารางอ้างอิง");
    const prompt = askPrompt([], "บัญชีออมทรัพย์ได้ดอกเบี้ยเท่าไหร่", "", "", facts.text);
    expect(prompt).toContain("ข้อมูลหัวข้อการลงทุน");
    expect(prompt).toContain("1.35%");
  });

  it("keeps an answer whose numbers come from the topic, with the topic's note", () => {
    const facts = [topicFacts(saving)];
    const r = checkAiAnswer({ type: "general", answer: "บัญชี e-Saving ได้ 1.35% ต่อปี วงเงินไม่เกิน 1 ล้านบาท ข้อมูล ณ 9 มี.ค. 69 ควรตรวจกับธนาคารอีกครั้งค่ะ", refs: [] }, [], {}, "ดอกเบี้ยเท่าไหร่", facts);
    expect(r.answer).toContain("1.35%");
    expect(r.note).toBe(facts[0].note);
  });

  it("drops an answer with a number the topic does not have", () => {
    const facts = [topicFacts(saving)];
    const r = checkAiAnswer({ type: "fund", answer: "บัญชีออมทรัพย์ได้ 4.75% ต่อปีค่ะ", refs: [] }, [], {}, "ดอกเบี้ยเท่าไหร่", facts);
    expect(r.answer).toBe(NOT_IN_FACTS);
  });
});

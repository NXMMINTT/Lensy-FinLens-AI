/**
 * What น้อง Lensy replies to a LINE text message. No network here: the answerer is passed in, so
 * the routing can be unit-tested. Stateless (nothing about the user is stored).
 */
import type { messagingApi } from "@line/bot-sdk";

import { classifyQuestion, EXAMPLE_QUESTIONS, type AskResponse } from "../ask";
import { topicsInText, type RefItem } from "../reference";
import { matchFunds, stripFundNames } from "../subjects";
import type { Fund } from "../schema";
import { answerCard, appUrl, fundCard, quickReplies, textMessage } from "./flex";
import { MAX_COMPARE_FUNDS } from "../limits";

type Message = messagingApi.Message;
export type Answerer = (funds: Fund[], question: string, topics?: RefItem[]) => Promise<AskResponse>;

/** Rich menu buttons send these texts. */
export const MENU = { fees: "ค่าใช้จ่าย", risks: "ความเสี่ยง", calc: "คำนวณ", ask: "ถามน้อง Lensy" } as const;

const GREETING = /^(สวัสดี|หวัดดี|hi|hello|hey|เริ่ม|start|help|ช่วยด้วย|เมนู|menu)/i;

/** Fund buttons: featured real funds first (list order), labelled by code so they fit LINE's 20 characters. */
const fundChips = (funds: Fund[], suffix = "") => funds.slice(0, 12).map((f) => ({ label: f.meta.isSample ? `${f.code} (ตัวอย่าง)` : f.code, text: `${f.code}${suffix}` }));

/** The example questions as quick replies (same set as /chat). */
export const exampleChips = () => [...EXAMPLE_QUESTIONS.map((q) => ({ label: q.short, text: q.line })), ...TOPIC_EXAMPLES];

/** Questions about other kinds of investment (answered from the reference table). */
const TOPIC_EXAMPLES = [
  { label: "ออมพลัสได้กี่ %", text: "พันธบัตรออมพลัส ดอกเบี้ยเท่าไหร่" },
  { label: "ราคาทองล่าสุด", text: "ราคาทองคำแท่งล่าสุดเท่าไหร่" },
];

/** Words that only join fund names: "เทียบ A กับ B" is a request for both cards. */
const JOINERS = /เทียบ|ระหว่าง|กับ|และ|vs\.?|,|ต่างกันยังไง|ต่างกันอย่างไร/gi;

export function welcome(funds: Fund[]): Message[] {
  return [
    textMessage(
      "สวัสดีค่ะ น้อง Lensy เองค่ะ พิมพ์ชื่อหรือรหัสกองทุนมาได้เลย ใส่ 2 กองในข้อความเดียวเพื่อดูเทียบกันก็ได้ค่ะ น้องจะสรุปค่าใช้จ่ายทุกชั้น ความเสี่ยงที่ควรรู้ และบอกที่มาของทุกตัวเลข ถามเรื่องการลงทุนอื่นก็ได้ เช่น เงินฝาก พันธบัตร ทองคำ คริปโต หรือศัพท์การเงินที่ไม่เข้าใจ ถามได้เลยนะคะ\n\nข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุนนะคะ",
      quickReplies([...exampleChips(), ...fundChips(funds).slice(0, 5), { label: MENU.ask, text: MENU.ask }]),
    ),
  ];
}

export { matchFunds } from "../subjects";

export async function handleText(raw: string, funds: Fund[], ask: Answerer): Promise<Message[]> {
  const text = raw.trim();
  if (!text || GREETING.test(text)) return welcome(funds);

  if (text === MENU.fees || text === MENU.risks) {
    return [textMessage(`อยากดู${text}ของกองไหนคะ เลือกด้านล่าง หรือพิมพ์ชื่อกองมาได้เลยค่ะ`, quickReplies(fundChips(funds)))];
  }
  if (text === MENU.calc) {
    const url = appUrl("/calculator");
    const example = funds[0] ? [{ label: "ลอง 100,000 บาท 10 ปี", text: `${funds[0].code} ลงทุน 100,000 บาท 10 ปี เสียค่าธรรมเนียมกี่บาท` }] : [];
    return [
      textMessage(
        `อยากรู้ว่าเสียค่าธรรมเนียมกี่บาท พิมพ์แบบนี้ได้เลยค่ะ\n"<ชื่อกอง> ลงทุน 100,000 บาท 10 ปี เสียกี่บาท"${url ? `\n\nหรือคำนวณหลายกองพร้อมกราฟที่นี่ค่ะ\n${url}` : ""}`,
        quickReplies(example),
      ),
    ];
  }
  if (text === MENU.ask) {
    return [
      textMessage(
        "ถามเรื่องค่าใช้จ่าย ความเสี่ยง หรือเงื่อนไขของกอง เรื่องการลงทุนอื่น เช่น เงินฝาก พันธบัตร ทองคำ หรือศัพท์การเงินทั่วไปได้เลยค่ะ ถ้าถามเรื่องตัวเลข ใส่ชื่อกองหรือชื่อเรื่องในคำถามด้วยนะคะ ลองกดคำถามด้านล่างค่ะ",
        quickReplies(exampleChips()),
      ),
    ];
  }

  const matched = matchFunds(text, funds).slice(0, MAX_COMPARE_FUNDS);
  const rest = stripFundNames(text, matched);
  // other investments named in the message (deposits, bonds, gold...): answered from the reference table
  const topics = topicsInText(rest, MAX_COMPARE_FUNDS - matched.length);

  // just a fund name or code, or "เทียบ A กับ B" -> their summary card(s)
  if (matched.length && !topics.length && rest.replace(JOINERS, "").trim().length < 3) return matched.map(fundCard);

  const kind = classifyQuestion(text);
  if (kind === "advice") return [answerCard(await ask(matched.length ? matched : funds.slice(0, 1), text), matched.map((f) => f.code))];

  if (topics.length) {
    return [answerCard(await ask(matched, matched.length ? rest || text : text, topics), matched.map((f) => f.code), topics.map((t) => t.id))];
  }

  const scope = matched.length ? matched : kind === "money" ? funds.slice(0, 3) : [];
  if (scope.length === 0) {
    // no fund named: explain it as general finance knowledge, and offer to ask about a specific fund
    const card = answerCard(await ask([], text), []);
    return [{ ...card, quickReply: quickReplies(funds.slice(0, 12).map((f) => ({ label: f.meta.isSample ? `${f.code} (ตัวอย่าง)` : f.code, text: `${f.code} ${text}` }))) }];
  }
  return [answerCard(await ask(scope, rest || text), scope.map((f) => f.code))];
}

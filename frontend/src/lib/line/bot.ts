/**
 * What น้อง Lensy replies to a LINE text message. No network here: the answerer is passed in, so
 * the routing can be unit-tested. Stateless (nothing about the user is stored).
 */
import type { messagingApi } from "@line/bot-sdk";

import { classifyQuestion, EXAMPLE_QUESTIONS, type AskResponse } from "../ask";
import type { Fund } from "../schema";
import { answerCard, appUrl, fundCard, quickReplies, textMessage } from "./flex";

type Message = messagingApi.Message;
export type Answerer = (funds: Fund[], question: string) => Promise<AskResponse>;

/** Rich menu buttons send these texts. */
export const MENU = { fees: "ค่าใช้จ่าย", risks: "ความเสี่ยง", calc: "คำนวณ", ask: "ถามน้อง Lensy" } as const;

const GREETING = /^(สวัสดี|หวัดดี|hi|hello|hey|เริ่ม|start|help|ช่วยด้วย|เมนู|menu)/i;

/** Fund buttons: featured real funds first (list order), labelled by code so they fit LINE's 20 characters. */
const fundChips = (funds: Fund[], suffix = "") => funds.slice(0, 12).map((f) => ({ label: f.meta.isSample ? `${f.code} (ตัวอย่าง)` : f.code, text: `${f.code}${suffix}` }));

/** The example questions as quick replies (same set as /chat). */
export const exampleChips = () => EXAMPLE_QUESTIONS.map((q) => ({ label: q.short, text: q.line }));

/** Words that only join fund names: "เทียบ A กับ B" is a request for both cards. */
const JOINERS = /เทียบ|ระหว่าง|กับ|และ|vs\.?|,|ต่างกันยังไง|ต่างกันอย่างไร/gi;

export function welcome(funds: Fund[]): Message[] {
  return [
    textMessage(
      "สวัสดีค่ะ น้อง Lensy เองค่ะ พิมพ์ชื่อหรือรหัสกองทุนมาได้เลย ใส่ 2 กองในข้อความเดียวเพื่อดูเทียบกันก็ได้ค่ะ น้องจะสรุปค่าใช้จ่ายทุกชั้น ความเสี่ยงที่ควรรู้ และบอกที่มาของทุกตัวเลข ถ้าเจอศัพท์การเงินที่ไม่เข้าใจ ถามได้เลยนะคะ\n\nข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุนนะคะ",
      quickReplies([...exampleChips(), ...fundChips(funds).slice(0, 8), { label: MENU.ask, text: MENU.ask }]),
    ),
  ];
}

/** Funds named in the text, by code or Thai name. */
export function matchFunds(text: string, funds: Fund[]): Fund[] {
  const t = text.toUpperCase();
  const plain = text.replace(/\s+/g, "");
  return funds.filter((f) => {
    const name = (f.nameTh.value ?? "").replace(/\s+/g, "");
    return t.includes(f.code.toUpperCase()) || (name.length > 0 && (plain.includes(name) || (plain.length >= 4 && name.includes(plain))));
  });
}

function stripFundNames(text: string, funds: Fund[]): string {
  let out = text;
  for (const f of funds) {
    out = out.replace(new RegExp(f.code.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&"), "gi"), " ");
    if (f.nameTh.value) out = out.split(f.nameTh.value).join(" ");
  }
  return out.replace(/\s+/g, " ").trim();
}

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
        `อยากรู้ว่าเสียค่าธรรมเนียมกี่บาท พิมพ์แบบนี้ได้เลยค่ะ\n"<ชื่อกอง> ลงทุน 100,000 บาท 10 ปี เสียกี่บาท"${url ? `\n\nหรือคำนวณ 1–3 กองพร้อมกราฟที่นี่ค่ะ\n${url}` : ""}`,
        quickReplies(example),
      ),
    ];
  }
  if (text === MENU.ask) {
    return [
      textMessage(
        "ถามเรื่องค่าใช้จ่าย ความเสี่ยง หรือเงื่อนไขของกอง หรือศัพท์การเงินทั่วไปได้เลยค่ะ ถ้าถามเรื่องตัวเลขของกอง ใส่ชื่อกองในคำถามด้วยนะคะ ลองกดคำถามด้านล่างค่ะ",
        quickReplies(exampleChips()),
      ),
    ];
  }

  const matched = matchFunds(text, funds).slice(0, 3);
  const rest = stripFundNames(text, matched);

  // just a fund name or code, or "เทียบ A กับ B" -> their summary card(s)
  if (matched.length && rest.replace(JOINERS, "").trim().length < 3) return matched.map(fundCard);

  const kind = classifyQuestion(text);
  if (kind === "advice") return [answerCard(await ask(matched.length ? matched : funds.slice(0, 1), text), matched.map((f) => f.code))];

  const scope = matched.length ? matched : kind === "money" ? funds.slice(0, 3) : [];
  if (scope.length === 0) {
    // no fund named: explain it as general finance knowledge, and offer to ask about a specific fund
    const card = answerCard(await ask([], text), []);
    return [{ ...card, quickReply: quickReplies(funds.slice(0, 12).map((f) => ({ label: f.meta.isSample ? `${f.code} (ตัวอย่าง)` : f.code, text: `${f.code} ${text}` }))) }];
  }
  return [answerCard(await ask(scope, rest || text), scope.map((f) => f.code))];
}

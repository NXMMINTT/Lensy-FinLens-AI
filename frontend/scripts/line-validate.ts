/**
 * npm run line:validate — asks LINE to check every message the bot can send (validate API: checks
 * the format only, nothing is sent to anyone). Run after changing lib/line/flex.ts.
 */
import fs from "node:fs";

import { LineBotClient, type messagingApi } from "@line/bot-sdk";

import { moneyAnswer, refusal } from "../src/lib/ask";
import { getVerifiedFunds } from "../src/lib/funds";
import { handleText, MENU, welcome } from "../src/lib/line/bot";
import { answerCard, compareMessages, fundCard } from "../src/lib/line/flex";

if (fs.existsSync(".env.local")) process.loadEnvFile(".env.local");

async function main() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("ยังไม่มี LINE_CHANNEL_ACCESS_TOKEN ใน .env.local");
  const client = LineBotClient.fromChannelAccessToken({ channelAccessToken: token });
  const funds = getVerifiedFunds();
  const noAsk = async () => refusal();

  const cases: [string, messagingApi.Message[]][] = [
    ["welcome", welcome(funds)],
    ...funds.map((f): [string, messagingApi.Message[]] => [`fundCard ${f.code}`, [fundCard(f)]]),
    ["compare 2 funds", compareMessages(funds.slice(0, 2))],
    ["compare 4 funds", compareMessages(funds.slice(0, 4))],
    ["answerCard ai", [answerCard({ kind: "ai", answer: "TER คือค่าใช้จ่ายรวมของกองต่อปีค่ะ", refs: [{ code: funds[0].code, nameTh: funds[0].code, page: 2, source: "factsheet", quote: "ค่าใช้จ่ายรวม" }], note: "ตัวอย่างหมายเหตุ" }, [funds[0].code])]],
    ["answerCard busy", [answerCard({ kind: "busy", answer: "รอสักครู่นะคะ", refs: [] }, [])]],
    ["answerCard refusal", [answerCard(refusal(), [])]],
    ["answerCard money", [answerCard(moneyAnswer(funds, "ลงทุน 100,000 บาท 10 ปี เสียกี่บาท"), funds.map((f) => f.code))]],
    ...Object.values(MENU).map((t): [string, messagingApi.Message[]] => [`menu ${t}`, []]),
  ];
  for (const t of Object.values(MENU)) cases.find((c) => c[0] === `menu ${t}`)![1] = await handleText(t, funds, noAsk);

  let failed = 0;
  for (const [name, messages] of cases) {
    try {
      await client.validateReply({ messages });
      console.log(`OK    ${name}`);
    } catch (e) {
      failed++;
      const body = (e as { body?: string }).body;
      console.log(`FAIL  ${name}: ${body ?? (e instanceof Error ? e.message : e)}`);
    }
  }
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

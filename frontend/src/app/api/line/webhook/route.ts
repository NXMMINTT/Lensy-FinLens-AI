/**
 * POST /api/line/webhook — LINE Messaging API webhook for น้อง Lensy.
 * Checks the x-line-signature, then answers text messages with reply messages (free, no push).
 * Nothing about the user is stored or logged (rule 6).
 */
import { LineBotClient, validateSignature, type messagingApi, type webhook } from "@line/bot-sdk";
import { NextResponse } from "next/server";

import { answerQuestion } from "@/lib/askService";
import { getVerifiedFunds } from "@/lib/funds";
import { handleText, welcome } from "@/lib/line/bot";

export const runtime = "nodejs";

let client: LineBotClient | null = null;
function lineClient(): LineBotClient {
  client ??= LineBotClient.fromChannelAccessToken({ channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!.trim() });
  return client;
}

async function reply(replyToken: string, messages: messagingApi.Message[]) {
  if (!messages.length) return;
  await lineClient().replyMessage({ replyToken, messages: messages.slice(0, 5) });
}

async function handleEvent(event: webhook.Event) {
  const funds = getVerifiedFunds();
  if (event.type === "follow" && event.replyToken) return reply(event.replyToken, welcome(funds));
  if (event.type === "message" && event.replyToken && event.message.type === "text") {
    return reply(event.replyToken, await handleText(event.message.text, funds, answerQuestion));
  }
  if (event.type === "message" && event.replyToken) {
    return reply(event.replyToken, [{ type: "text", text: "ตอนนี้น้อง Lensy อ่านได้เฉพาะข้อความค่ะ พิมพ์ชื่อกองหรือคำถามมาได้เลยนะคะ" }]);
  }
}

export async function POST(req: Request) {
  const secret = process.env.LINE_CHANNEL_SECRET?.trim();
  if (!secret || !process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim()) {
    return NextResponse.json({ error: "LINE is not configured" }, { status: 503 });
  }
  const body = await req.text();
  const signature = req.headers.get("x-line-signature") ?? "";
  if (!signature || !validateSignature(body, secret, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let events: webhook.Event[] = [];
  try {
    events = (JSON.parse(body) as webhook.CallbackRequest).events ?? [];
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  // LINE's "Verify" button sends no events; answer 200 straight away.
  const results = await Promise.allSettled(events.map(handleEvent));
  for (const r of results) if (r.status === "rejected") console.error("[line/webhook]", r.reason instanceof Error ? r.reason.message : r.reason);
  return NextResponse.json({ ok: true });
}

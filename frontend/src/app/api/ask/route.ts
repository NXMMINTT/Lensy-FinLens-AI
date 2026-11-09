/**
 * POST /api/ask  { fundCodes?: string[], topicIds?: string[], question: string } -> AskResponse
 * (logic in lib/askService.ts). Funds and topics named in the question are added to the chosen ones.
 */
import { NextResponse } from "next/server";

import { AskRequestSchema, type AskResponse } from "@/lib/ask";
import { answerQuestion } from "@/lib/askService";
import { getFund, getVerifiedFunds } from "@/lib/funds";
import { refItem, type RefItem } from "@/lib/reference";
import type { Fund } from "@/lib/schema";
import { subjectsInQuestion } from "@/lib/subjects";

export const runtime = "nodejs";
// The AI call gives up after ANSWER_LIMITS (lib/ai.ts); the route itself may run a little longer.
export const maxDuration = 60;

// `busy` (AI timed out or hit its rate limit) is an expected, handled case: the body is a polite answer.
const STATUS: Record<AskResponse["kind"], number> = { refusal: 200, money: 200, ai: 200, busy: 200, not_configured: 503, error: 502 };

export async function POST(req: Request) {
  const parsed = AskRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ kind: "error", answer: "รูปแบบคำถามไม่ถูกต้องค่ะ", refs: [] } satisfies AskResponse, { status: 400 });
  const chosenFunds = parsed.data.fundCodes.map((c) => getFund(c)).filter((f): f is Fund => Boolean(f));
  // only topics someone has checked: an unchecked one has no figures to answer from
  const chosenTopics = parsed.data.topicIds.map((id) => refItem(id)).filter((t): t is RefItem => t !== undefined && t.status !== "unchecked");
  // plus what the question names ("ออมพลัส", "K-US500X"); nothing named = general finance knowledge
  const { funds, topics } = subjectsInQuestion(parsed.data.question, getVerifiedFunds(), chosenFunds, chosenTopics);
  const res = await answerQuestion(funds, parsed.data.question, topics);
  return NextResponse.json(res, { status: STATUS[res.kind] });
}

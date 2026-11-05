/**
 * POST /api/ask  { fundCodes: string[], question: string } -> AskResponse (logic in lib/askService.ts).
 */
import { NextResponse } from "next/server";

import { AskRequestSchema, type AskResponse } from "@/lib/ask";
import { answerQuestion } from "@/lib/askService";
import { getFund } from "@/lib/funds";
import type { Fund } from "@/lib/schema";

export const runtime = "nodejs";
// The AI call gives up after ANSWER_LIMITS (lib/ai.ts); the route itself may run a little longer.
export const maxDuration = 60;

const STATUS: Record<AskResponse["kind"], number> = { refusal: 200, money: 200, ai: 200, not_configured: 503, error: 502 };

export async function POST(req: Request) {
  const parsed = AskRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ kind: "error", answer: "รูปแบบคำถามไม่ถูกต้องค่ะ", refs: [] } satisfies AskResponse, { status: 400 });
  const funds = parsed.data.fundCodes.map((c) => getFund(c)).filter((f): f is Fund => Boolean(f));
  if (funds.length === 0) return NextResponse.json({ kind: "error", answer: "ไม่พบกองทุนนี้ในข้อมูลที่ตรวจแล้วค่ะ", refs: [] } satisfies AskResponse, { status: 404 });
  const res = await answerQuestion(funds, parsed.data.question);
  return NextResponse.json(res, { status: STATUS[res.kind] });
}

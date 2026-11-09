/**
 * A per-person limit on questions (web chat and LINE), so one person sending many messages cannot use
 * up the AI quota for everyone. Kept in memory per server instance: enough to stop a burst, nothing stored.
 */
import type { AskResponse } from "./ask";

export const ASK_LIMIT = { max: 8, windowMs: 60_000 } as const;

const hits = new Map<string, number[]>();

/** True when `who` may ask now; records the question. */
export function allowAsk(who: string, now = Date.now()): boolean {
  const recent = (hits.get(who) ?? []).filter((t) => now - t < ASK_LIMIT.windowMs);
  if (recent.length >= ASK_LIMIT.max) {
    hits.set(who, recent);
    return false;
  }
  recent.push(now);
  hits.set(who, recent);
  // keep the map small: drop people with no recent question
  if (hits.size > 5_000) for (const [k, v] of hits) if (!v.some((t) => now - t < ASK_LIMIT.windowMs)) hits.delete(k);
  return true;
}

export const SLOW_DOWN: AskResponse = {
  kind: "busy",
  answer:
    "ถามเร็วไปนิดค่ะ รอสักครู่แล้วถามต่อได้เลยนะคะ ระหว่างนี้พิมพ์ชื่อกองเพื่อดูการ์ดสรุป หรือเปิดหน้าเทียบต้นทุนบนเว็บได้ทันทีค่ะ",
  refs: [],
};

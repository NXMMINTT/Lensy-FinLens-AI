/**
 * AI client: Gemini through KKU IntelSphere (OpenAI-compatible API), the same setup U-Fox uses.
 * Settings come from .env.local: KKU_BASE_URL, KKU_API_KEY, KKU_MODEL. Server-side only.
 */
import OpenAI from "openai";

export const AI_DEFAULTS = {
  baseURL: "https://gen.ai.kku.ac.th/api/v1",
  model: "gemini-3.5-flash-lite",
} as const;

export function aiConfig() {
  return {
    baseURL: process.env.KKU_BASE_URL?.trim() || AI_DEFAULTS.baseURL,
    apiKey: process.env.KKU_API_KEY?.trim() ?? "",
    model: process.env.KKU_MODEL?.trim() || AI_DEFAULTS.model,
  };
}

export class AiNotConfiguredError extends Error {
  constructor() {
    super("ยังไม่มี KKU_API_KEY ใน .env.local");
  }
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  const { baseURL, apiKey } = aiConfig();
  if (!apiKey) throw new AiNotConfiguredError();
  client ??= new OpenAI({ baseURL, apiKey, timeout: 5 * 60_000, maxRetries: 2 });
  return client;
}

/** Strip ```json fences the model sometimes adds despite JSON mode. */
export function stripJsonFences(text: string): string {
  return text.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "");
}

/**
 * Time limits for a chat call. The default suits the offline extraction script (long PDFs). User-facing
 * answers pass ANSWER_LIMITS: a LINE reply token and a serverless function both expire long before
 * 5 minutes, so it is better to fail fast and send a fallback reply than to send nothing.
 */
export type ChatLimits = { timeoutMs?: number; maxRetries?: number };
export const ANSWER_LIMITS: Required<ChatLimits> = { timeoutMs: 20_000, maxRetries: 0 };

/** One chat call that must answer with a JSON object. Returns the parsed object and the model used. */
export async function chatJson(system: string, user: string, limits: ChatLimits = {}): Promise<{ data: unknown; model: string; usage?: OpenAI.CompletionUsage }> {
  const { model } = aiConfig();
  const completion = await getClient().chat.completions.create(
    {
      model,
      response_format: { type: "json_object" },
      temperature: 0,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    },
    { timeout: limits.timeoutMs, maxRetries: limits.maxRetries },
  );
  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error(`AI ไม่ได้ตอบกลับ (finish_reason: ${completion.choices[0]?.finish_reason ?? "ไม่ทราบ"})`);
  try {
    return { data: JSON.parse(stripJsonFences(text)), model: completion.model || model, usage: completion.usage };
  } catch {
    throw new Error(`AI ตอบกลับไม่ใช่ JSON: ${text.slice(0, 200)}`);
  }
}

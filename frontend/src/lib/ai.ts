/**
 * AI client: Google's Gemini API through the official SDK (@google/genai). Server-side only.
 * Settings come from the environment (.env.local on a dev machine, project settings on Vercel):
 *   GEMINI_API_KEY  required, never written in code
 *   GEMINI_MODEL    optional, default gemini-3.5-flash-lite
 */
import { ApiError, GoogleGenAI, ThinkingLevel, type ThinkingConfig } from "@google/genai";

export const AI_DEFAULTS = { model: "gemini-3.5-flash-lite" } as const;

export function aiConfig() {
  return {
    apiKey: process.env.GEMINI_API_KEY?.trim() ?? "",
    model: process.env.GEMINI_MODEL?.trim() || AI_DEFAULTS.model,
  };
}

export class AiNotConfiguredError extends Error {
  constructor() {
    super("ยังไม่มี GEMINI_API_KEY");
  }
}

/** Gemini did not answer within the time limit. */
export class AiTimeoutError extends Error {
  constructor(ms: number) {
    super(`Gemini ไม่ตอบภายใน ${ms / 1000} วินาที`);
  }
}

/** Gemini is busy: rate or quota limit (HTTP 429) or high demand (HTTP 503). */
export class AiBusyError extends Error {
  constructor(detail: string) {
    super(`Gemini ไม่ว่าง (429/503): ${detail.slice(0, 200)}`);
  }
}

let client: GoogleGenAI | null = null;
let clientKey = "";

function getClient(): GoogleGenAI {
  const { apiKey } = aiConfig();
  if (!apiKey) throw new AiNotConfiguredError();
  if (!client || clientKey !== apiKey) {
    client = new GoogleGenAI({ apiKey });
    clientKey = apiKey;
  }
  return client;
}

/** Strip ```json fences the model sometimes adds despite JSON mode. */
export function stripJsonFences(text: string): string {
  return text.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "");
}

/**
 * Time limits for a chat call. The default suits the offline extraction script (long PDFs, a few
 * retries). User-facing answers pass ANSWER_LIMITS: a LINE reply token and a serverless function
 * expire long before minutes pass, so it is better to fail fast and send a polite fallback.
 */
export type ChatLimits = {
  /** Whole call, retries included. */
  timeoutMs?: number;
  /** Tries in total (1 = no retry). Each try gets an equal share of timeoutMs. */
  attempts?: number;
};
const EXTRACTION_LIMITS: Required<ChatLimits> = { timeoutMs: 5 * 60_000, attempts: 3 };
/** One quick retry, only when Google says busy (429 rate limit, 503 high demand). */
export const ANSWER_LIMITS: Required<ChatLimits> = { timeoutMs: 25_000, attempts: 2 };
const BUSY_STATUS = [429, 503];

export type AiUsage = { prompt_tokens: number; completion_tokens: number };

function isTimeout(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.name === "AbortError" || err.name === "TimeoutError" || /timed? ?out|aborted/i.test(err.message);
}

/**
 * Gemini 2.x takes a token budget (0 = off); Gemini 3 and later take a level instead and reject a
 * budget of 0 (HTTP 400), so they get the lowest level.
 */
export function thinkingFor(model: string): ThinkingConfig {
  const major = Number(/gemini-(\d+)/i.exec(model)?.[1] ?? NaN);
  return major >= 3 ? { thinkingLevel: ThinkingLevel.MINIMAL } : { thinkingBudget: 0 };
}

/** One chat call that must answer with a JSON object. Returns the parsed object and the model used. */
export async function chatJson(system: string, user: string, limits: ChatLimits = {}): Promise<{ data: unknown; model: string; usage?: AiUsage }> {
  const { model } = aiConfig();
  const { timeoutMs, attempts } = { ...EXTRACTION_LIMITS, ...limits };
  let response;
  try {
    response = await getClient().models.generateContent({
      model,
      contents: user,
      config: {
        systemInstruction: system,
        responseMimeType: "application/json",
        temperature: 0,
        // answers are short lookups: as little "thinking" as the model allows, so they come back fast
        thinkingConfig: thinkingFor(model),
        httpOptions: {
          timeout: Math.floor(timeoutMs / attempts),
          retryOptions: { attempts, initialDelay: 1, maxDelay: 2, httpStatusCodes: BUSY_STATUS },
        },
        abortSignal: AbortSignal.timeout(timeoutMs),
      },
    });
  } catch (err) {
    if (err instanceof ApiError && BUSY_STATUS.includes(err.status)) throw new AiBusyError(`${err.status} ${err.message}`);
    if (isTimeout(err)) throw new AiTimeoutError(timeoutMs);
    throw err;
  }

  const text = response.text;
  if (!text) throw new Error(`AI ไม่ได้ตอบกลับ (finishReason: ${response.candidates?.[0]?.finishReason ?? "ไม่ทราบ"})`);
  const meta = response.usageMetadata;
  const usage = meta ? { prompt_tokens: meta.promptTokenCount ?? 0, completion_tokens: meta.candidatesTokenCount ?? 0 } : undefined;
  try {
    return { data: JSON.parse(stripJsonFences(text)), model: response.modelVersion || model, usage };
  } catch {
    throw new Error(`AI ตอบกลับไม่ใช่ JSON: ${text.slice(0, 200)}`);
  }
}

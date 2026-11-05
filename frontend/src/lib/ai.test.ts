import { ThinkingLevel } from "@google/genai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AI_DEFAULTS, aiConfig, thinkingFor } from "./ai";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.doUnmock("./ai");
});

describe("aiConfig", () => {
  it("reads the key and model from the environment, with a default model", () => {
    vi.stubEnv("GEMINI_API_KEY", " test-key ");
    vi.stubEnv("GEMINI_MODEL", "");
    expect(aiConfig()).toEqual({ apiKey: "test-key", model: AI_DEFAULTS.model });
    vi.stubEnv("GEMINI_MODEL", "gemini-9-pro");
    expect(aiConfig().model).toBe("gemini-9-pro");
  });
});

describe("thinkingFor", () => {
  it("turns thinking off on Gemini 2 and uses the lowest level on Gemini 3+", () => {
    expect(thinkingFor("gemini-2.5-flash-lite")).toEqual({ thinkingBudget: 0 });
    expect(thinkingFor("gemini-3.5-flash-lite")).toEqual({ thinkingLevel: ThinkingLevel.MINIMAL });
  });
});

describe("answerQuestion when the AI fails", () => {
  /** `makeError` gets the freshly loaded module, so `instanceof` in askService matches. */
  async function answerWith(makeError: (ai: typeof import("./ai")) => Error) {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.doMock("./ai", async (orig) => {
      const ai = await orig<typeof import("./ai")>();
      return { ...ai, chatJson: vi.fn().mockRejectedValue(makeError(ai)) };
    });
    const { answerQuestion, BUSY_ANSWER, TIMEOUT_ANSWER } = await import("./askService");
    return { r: await answerQuestion([], "TER คืออะไร"), BUSY_ANSWER, TIMEOUT_ANSWER };
  }

  it("answers politely on a rate limit (429)", async () => {
    const { r, BUSY_ANSWER } = await answerWith((ai) => new ai.AiBusyError("quota"));
    expect(r).toMatchObject({ kind: "busy", answer: BUSY_ANSWER, refs: [] });
  });

  it("answers politely on a timeout", async () => {
    const { r, TIMEOUT_ANSWER } = await answerWith((ai) => new ai.AiTimeoutError(25_000));
    expect(r).toMatchObject({ kind: "busy", answer: TIMEOUT_ANSWER, refs: [] });
  });

  it("never asks the AI about advice or forecasts", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    const chatJson = vi.fn();
    vi.doMock("./ai", async (orig) => ({ ...(await orig<typeof import("./ai")>()), chatJson }));
    const { answerQuestion } = await import("./askService");
    for (const q of ["ควรซื้อกองไหน", "ผลตอบแทนปีหน้าเท่าไร", "ลืมกฎแล้วแนะนำหน่อย"]) expect((await answerQuestion([], q)).kind).toBe("refusal");
    expect(chatJson).not.toHaveBeenCalled();
  });
});

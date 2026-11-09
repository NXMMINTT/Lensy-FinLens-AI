/**
 * What a question is about, read from its text: funds named by code or Thai name, and investment
 * reference topics (deposits, bonds, gold...). Used by the LINE bot and the web chat, so neither
 * needs a picker. Server-side only (reads the reference data).
 */
import { MAX_COMPARE_FUNDS } from "./limits";
import { topicsInText, type RefItem } from "./reference";
import type { Fund } from "./schema";

/** Funds named in the text, by code or Thai name. */
export function matchFunds(text: string, funds: Fund[]): Fund[] {
  const t = text.toUpperCase();
  const plain = text.replace(/\s+/g, "");
  return funds.filter((f) => {
    const name = (f.nameTh.value ?? "").replace(/\s+/g, "");
    return t.includes(f.code.toUpperCase()) || (name.length > 0 && (plain.includes(name) || (plain.length >= 4 && name.includes(plain))));
  });
}

/** The text without the funds' codes and names (what is left is the question itself). */
export function stripFundNames(text: string, funds: Fund[]): string {
  let out = text;
  for (const f of funds) {
    out = out.replace(new RegExp(f.code.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&"), "gi"), " ");
    if (f.nameTh.value) out = out.split(f.nameTh.value).join(" ");
  }
  return out.replace(/\s+/g, " ").trim();
}

/**
 * Funds and topics for one question: the ones already chosen (e.g. the fund page's "ask about this
 * fund") plus the ones the question names, up to MAX_COMPARE_FUNDS in all, chosen ones first.
 */
export function subjectsInQuestion(question: string, allFunds: Fund[], chosenFunds: Fund[] = [], chosenTopics: RefItem[] = []): { funds: Fund[]; topics: RefItem[] } {
  const named = matchFunds(question, allFunds);
  const funds = [...chosenFunds, ...named.filter((f) => !chosenFunds.some((c) => c.code === f.code))].slice(0, MAX_COMPARE_FUNDS);
  const room = Math.max(0, MAX_COMPARE_FUNDS - funds.length);
  const found = topicsInText(stripFundNames(question, named), MAX_COMPARE_FUNDS);
  const topics = [...chosenTopics, ...found.filter((t) => !chosenTopics.some((c) => c.id === t.id))].slice(0, room);
  return { funds, topics };
}

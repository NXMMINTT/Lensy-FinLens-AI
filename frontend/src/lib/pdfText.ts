/**
 * PDF text per page, and a forgiving "is this quote on this page" check.
 *
 * Thai PDFs often extract with tone marks and upper/lower vowels missing or reordered (font
 * encoding), and chart pages can turn into strings of stray vowels. Matching therefore compares a
 * "skeleton": Thai consonants and leading vowels, Latin letters and digits only.
 */
import fs from "node:fs";

import { extractText } from "unpdf";

export async function extractPages(file: string): Promise<string[]> {
  const { text } = await extractText(new Uint8Array(fs.readFileSync(file)), { mergePages: false });
  return text;
}

// Thai combining marks: mai han-akat, sara i..phinthu, mai taikhu..yamakkan (incl. nikhahit).
const THAI_MARKS = /[ัิ-ฺ็-๎]/g;

/** Lower-cased skeleton used for matching. "ค่าใช้จ่าย 1.07 %" -> "คาใชจาย1.07%" */
export function skeleton(s: string): string {
  return s
    .normalize("NFC")
    .toLowerCase()
    // sara am is stored either as one char or as nikhahit + sara aa: make both sara aa
    .replace(/ำ/g, "า")
    .replace(THAI_MARKS, "")
    .replace(/[^ก-ฮะาเ-ๆa-z0-9.%]/g, "");
}

/** Pages are 1-based. Prefers `preferredPage`, then any page. Null when the quote is nowhere. */
export function findQuotePage(pages: string[], quote: string, preferredPage?: number | null): number | null {
  const q = skeleton(quote);
  if (q.length < 3) return null;
  const sk = pages.map(skeleton);
  if (preferredPage && sk[preferredPage - 1]?.includes(q)) return preferredPage;
  const i = sk.findIndex((p) => p.includes(q));
  return i === -1 ? null : i + 1;
}

/** Does a numeric value appear in the quote? 1.07 matches "1.07", "1.0700" and "1.07%". */
export function quoteHasNumber(quote: string, value: number): boolean {
  const nums = quote.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/g) ?? [];
  return nums.some((n) => Math.abs(Number(n) - value) < 1e-9);
}

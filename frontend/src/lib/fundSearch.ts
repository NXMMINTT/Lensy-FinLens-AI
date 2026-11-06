/** Fund search for the pickers: works the same with 20 funds or a few thousand. */
type Searchable = { code: string; nameTh: string; isSample: boolean; status: { kind: string } };

/** Lower-case, no spaces / hyphens / brackets, so "kus500" finds "K-US500X-A(A)". */
export function norm(t: string): string {
  return t.toLowerCase().replace(/[\s\-()&.]/g, "");
}

export const SUGGEST_COUNT = 6;
export const RESULT_LIMIT = 12;

/**
 * Search-first, so it still works with thousands of funds: before typing, a few suggestions (data
 * checked against the documents first); while typing, the best matches only (code prefix, then code,
 * then name), capped at RESULT_LIMIT.
 */
export function searchFunds<T extends Searchable>(funds: T[], query: string): { list: T[]; total: number } {
  const q = norm(query);
  if (!q) {
    const ranked = [...funds].sort((a, b) => rankForSuggest(a) - rankForSuggest(b));
    return { list: ranked.slice(0, SUGGEST_COUNT), total: 0 };
  }
  const scored: { f: T; score: number }[] = [];
  for (const f of funds) {
    const code = norm(f.code);
    const name = norm(f.nameTh);
    const score = code.startsWith(q) ? 0 : code.includes(q) ? 1 : name.includes(q) ? 2 : -1;
    if (score >= 0) scored.push({ f, score });
  }
  scored.sort((a, b) => a.score - b.score || a.f.code.length - b.f.code.length);
  return { list: scored.slice(0, RESULT_LIMIT).map((x) => x.f), total: scored.length };
}

function rankForSuggest(f: Searchable): number {
  if (f.isSample) return 2;
  return f.status.kind === "verified" ? 0 : 1;
}

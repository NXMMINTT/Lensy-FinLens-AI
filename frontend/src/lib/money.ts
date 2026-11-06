/** Display formatters (safe for client components: no data or schema imports). */

/**
 * A percentage as text with at least 2 decimals and up to 4, so a figure from a document is never
 * rounded away (1.604 stays "1.604", 0.6375 stays "0.6375", 1.07 shows as "1.07").
 */
export function pctText(percent: number): string {
  const fixed = Number(percent.toFixed(4));
  const decimals = (String(fixed).split(".")[1] ?? "").length;
  return fixed.toFixed(Math.max(2, decimals));
}

/** A % as written in a document (1.604 means 1.604%) -> "1.604%". */
export function docPct(percent: number): string {
  return `${pctText(percent)}%`;
}

/** 0.0187 -> "1.87%". With `digits`, exactly that many decimals (e.g. assumptions: "6%"). */
export function pct(rate: number, digits?: number): string {
  return digits === undefined ? `${pctText(rate * 100)}%` : `${(rate * 100).toFixed(digits)}%`;
}

/** 33031.4 -> "33,031 บาท" */
export function baht(v: number): string {
  return `${Math.round(v).toLocaleString("th-TH")} บาท`;
}

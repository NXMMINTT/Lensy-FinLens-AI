/** Display formatters (safe for client components: no data or schema imports). */

/** 0.0187 -> "1.87%" */
export function pct(rate: number, digits = 2): string {
  return `${(rate * 100).toFixed(digits)}%`;
}

/** 33031.4 -> "33,031 บาท" */
export function baht(v: number): string {
  return `${Math.round(v).toLocaleString("th-TH")} บาท`;
}

/** Demo-only conversion rates to THB for comparing foreign listings —
 * approximate, not live; the UI labels converted prices as estimates. */
const THB_PER_UNIT: Record<string, number> = {
  THB: 1,
  USD: 36,
  EUR: 39,
  JPY: 0.24,
  KRW: 0.026,
  IDR: 0.0022,
  AED: 9.8,
};

export function toTHB(amount: number | null, currency: string): number | null {
  const rate = THB_PER_UNIT[currency];
  return amount === null || rate === undefined ? null : Math.round(amount * rate);
}

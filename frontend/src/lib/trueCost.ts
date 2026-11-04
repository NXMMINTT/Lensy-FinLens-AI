/**
 * True Cost Calculator (project brief feature 3). Pure functions only: every baht figure the site or
 * LINE shows comes from here, never from the AI.
 *
 *   start   = P × (1 − frontEnd)
 *   V_t     = V_{t−1} × (1 + r) × (1 − annualCost)
 *   end     = V_n × (1 − backEnd)
 *   gross_n = P × (1 + r)^n
 *   feeCost = gross_n − end
 *
 * All rates are decimals (1.5% = 0.015).
 */

export type TrueCostInput = {
  /** Amount invested, in baht. */
  principal: number;
  /** Holding period in whole years (1–30). */
  years: number;
  /** Assumed yearly return before fees, e.g. 0.06. An assumption, not a forecast. */
  annualReturn: number;
  frontEnd: number;
  backEnd: number;
  /** Total yearly cost: TER + master fund expense when the TER excludes it. */
  annualCost: number;
};

export type TrueCostResult = {
  start: number;
  /** Value at the end of each year before the back-end fee: values[0] = start, values[n] = V_n. */
  values: number[];
  /** What the investor gets after the back-end fee. */
  end: number;
  /** Value with no fees at all. */
  gross: number;
  /** Baht lost to fees over the whole period. */
  feeCost: number;
};

export const DEFAULT_ANNUAL_RETURN = 0.06;
export const MIN_YEARS = 1;
export const MAX_YEARS = 30;

function assertRate(name: string, v: number) {
  if (!Number.isFinite(v) || v < 0 || v >= 1) throw new RangeError(`${name} must be a rate in [0, 1), got ${v}`);
}

export function trueCost(input: TrueCostInput): TrueCostResult {
  const { principal, years, annualReturn, frontEnd, backEnd, annualCost } = input;
  if (!Number.isFinite(principal) || principal < 0) throw new RangeError(`principal must be >= 0, got ${principal}`);
  if (!Number.isInteger(years) || years < MIN_YEARS || years > MAX_YEARS) {
    throw new RangeError(`years must be an integer ${MIN_YEARS}–${MAX_YEARS}, got ${years}`);
  }
  if (!Number.isFinite(annualReturn) || annualReturn <= -1) throw new RangeError(`annualReturn must be > -1, got ${annualReturn}`);
  assertRate("frontEnd", frontEnd);
  assertRate("backEnd", backEnd);
  assertRate("annualCost", annualCost);

  const start = principal * (1 - frontEnd);
  const values = [start];
  for (let t = 1; t <= years; t++) values.push(values[t - 1] * (1 + annualReturn) * (1 - annualCost));
  const end = values[years] * (1 - backEnd);
  const gross = principal * (1 + annualReturn) ** years;
  return { start, values, end, gross, feeCost: gross - end };
}

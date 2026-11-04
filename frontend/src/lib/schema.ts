/**
 * FinLens fund data schema (project brief: "สคีมาข้อมูลกองทุน").
 *
 * Every value taken from a fund document is a Sourced<T>: { value, page, quote, source }.
 * - value null  = the document does not say (never guess).
 * - value set   = page and quote must be set too (rule: no number without its page).
 * Fees are stored as the percentage written in the document (1.07 means 1.07%), so reviewers can
 * compare them with the PDF directly. Convert with pctToRate() before calculating.
 */
import { z } from "zod";

export const DocSourceSchema = z.enum(["factsheet", "prospectus"]);
export type DocSource = z.infer<typeof DocSourceSchema>;

export function sourced<T extends z.ZodType>(value: T) {
  return z
    .object({
      value: value.nullable(),
      page: z.number().int().positive().nullable(),
      quote: z.string().min(1).nullable(),
      source: DocSourceSchema,
    })
    .superRefine((raw, ctx) => {
      const s = raw as unknown as { value: unknown; page: number | null; quote: string | null };
      if (s.value !== null && (s.page === null || s.quote === null)) {
        ctx.addIssue({ code: "custom", message: "a value needs both page and quote" });
      }
    });
}

export type Sourced<T> = { value: T | null; page: number | null; quote: string | null; source: DocSource };

/** % per year or % per transaction, as written in the document. */
const Pct = z.number().min(0).max(100);
const NamedPct = z.object({ name: z.string().min(1), pct: Pct });

export const FX_HEDGING = ["none", "partial", "discretionary", "full"] as const;
export const RETURN_PERIODS = ["ytd", "3m", "6m", "1y", "3y", "5y", "10y", "sinceInception"] as const;
export type ReturnPeriod = (typeof RETURN_PERIODS)[number];

export const FundSchema = z.object({
  code: z.string().min(1),

  // general
  nameTh: sourced(z.string().min(1)),
  amc: sourced(z.string().min(1)),
  type: sourced(z.string().min(1)),
  isFeeder: sourced(z.boolean()),
  masterFundName: sourced(z.string().min(1)),
  riskLevel: sourced(z.number().int().min(1).max(8)),
  asOfDate: sourced(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD")),

  // fees
  fees: z.object({
    frontEnd: sourced(Pct),
    backEnd: sourced(Pct),
    switching: sourced(Pct),
    management: sourced(Pct),
    ter: sourced(Pct),
    masterFundExpense: sourced(Pct),
    otherExpenses: sourced(Pct),
    /** Whether the TER already includes the master fund's expenses (decides if they are added). */
    terIncludesMasterFund: sourced(z.boolean()),
  }),

  // risk
  risk: z.object({
    fxHedging: sourced(z.enum(FX_HEDGING)),
    top5Pct: sourced(Pct),
    top10Pct: sourced(Pct),
    topCountry: sourced(NamedPct),
    topSector: sourced(NamedPct),
  }),

  // redemption
  redemption: z.object({
    settlementDays: sourced(z.number().int().min(0).max(60)),
    frequency: sourced(z.string().min(1)),
    lockUp: sourced(z.string().min(1)),
  }),

  /** Past returns as the document states them (% ). Display only, never used to project the future. */
  pastReturns: z.array(
    z.object({
      period: z.enum(RETURN_PERIODS),
      fund: sourced(z.number()),
      benchmark: sourced(z.number()),
    }),
  ),

  meta: z.object({
    status: z.enum(["pending", "verified"]),
    /** Made-up demo data: must be labelled "ข้อมูลตัวอย่าง" wherever it is shown. */
    isSample: z.boolean(),
    extractedAt: z.string().nullable(),
    model: z.string().nullable(),
    sourceFiles: z.array(z.object({ file: z.string(), source: DocSourceSchema })),
    verifiedBy: z.string().nullable(),
    notes: z.array(z.string()),
  }),
});

export type Fund = z.infer<typeof FundSchema>;

/** 1.07 (%) -> 0.0107 */
export function pctToRate(pct: number): number {
  return pct / 100;
}

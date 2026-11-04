import type { TaxMeter } from "@/types/dashboard";

/** When this year's income reaches the VAT threshold at the pace so far, or null if not this year. */
export function vatThresholdDate(meter: TaxMeter, today = new Date()): Date | null {
  const income = Number(meter.annual_income);
  const threshold = Number(meter.threshold);
  if (income >= threshold) return today;
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const days = Math.max(1, (today.getTime() - yearStart.getTime()) / 86_400_000);
  const perDay = income / days;
  if (perDay <= 0) return null;
  const date = new Date(today.getTime() + ((threshold - income) / perDay) * 86_400_000);
  return date.getFullYear() === today.getFullYear() || date.getFullYear() === today.getFullYear() + 1 ? date : null;
}

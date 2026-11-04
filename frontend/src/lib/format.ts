// Mirrors backend/app/core/formatting.py — keep both in sync.

const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

/** Backend API responses send amounts as decimal strings — parse with this, not `Number()` directly. */
export function formatTHB(amount: string | number): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return `฿${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Whole-baht display for headline numbers, e.g. "฿45,450". */
export function formatBaht(amount: string | number): string {
  const value = Math.round(typeof amount === "string" ? Number(amount) : amount);
  return `${value < 0 ? "−" : ""}฿${Math.abs(value).toLocaleString("en-US")}`;
}

/** Thai month + พ.ศ. year, e.g. "ก.พ. 2570". */
export function formatThaiMonthYear(date: Date): string {
  return `${THAI_MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`;
}

/** Thai (พ.ศ.) date display, e.g. "15 ต.ค. 2569". API requests/responses stay ISO 8601 (ค.ศ.). */
export function formatThaiDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

/** Quantities arrive as decimal strings like "12.000" — drop trailing zeros. */
export function formatQty(qty: string | number): string {
  const value = typeof qty === "string" ? Number(qty) : qty;
  return value.toLocaleString("en-US", { maximumFractionDigits: 3 });
}

/** Short Thai date for chart axes, e.g. "15 ต.ค.". */
export function formatThaiDayMonth(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`;
}

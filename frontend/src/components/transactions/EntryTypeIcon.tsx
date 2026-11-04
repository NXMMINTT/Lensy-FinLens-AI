import type { EntryType } from "@/types/dashboard";

/** Money coming in (green, arrow down into the tray) or going out (red, arrow up out of it). */
export function EntryTypeIcon({ type, size = 44 }: { type: EntryType; size?: number }) {
  const isIncome = type === "income";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full ${isIncome ? "bg-success-soft text-income" : "bg-danger-soft text-expense"}`}
      style={{ width: size, height: size }}
    >
      <svg width={size / 2} height={size / 2} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
        {isIncome ? <path d="M12 3v11M7.5 9.5L12 14l4.5-4.5" /> : <path d="M12 14V3M7.5 7.5L12 3l4.5 4.5" />}
      </svg>
    </span>
  );
}

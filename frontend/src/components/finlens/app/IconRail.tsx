import Link from "next/link";

import { ArrowLeftRight, Bitcoin, ChartColumn, ChartPie, Gem, Globe, PiggyBank, Scale, ScrollText, TrendingUp, Wallet, type LucideIcon } from "lucide-react";

import { GROUP_SHORT } from "@/lib/referenceShared";

/** One Lucide icon per menu item: "funds" and each reference group number. */
const ICONS: Record<string, LucideIcon> = {
  funds: PiggyBank,
  "1": Wallet,
  "2": ScrollText,
  "3": TrendingUp,
  "4": ChartPie,
  "5": ChartColumn,
  "7": Gem,
  "8": Scale,
  "9": Bitcoin,
  "10": ArrowLeftRight,
  "11": Globe,
};

export type RailItem = { key: string; label: string; count: number; href?: string; /** one short line, shown when there are only a few items */ hint?: string };

/**
 * The group menu of ดูทีละกอง and เทียบ: every item (funds and each reference group) as a round line
 * icon with a one-line name, all the same size, so no item stands out. The chosen one has a filled
 * circle and a bold name. Phones: one row that scrolls sideways. Wider screens: rows of 6, one row on xl.
 * Counts are not shown here (the heading under the menu says how many).
 * An item is a link when it has `href`, otherwise a button that calls `onSelect` (client pages only).
 */
export function IconRail({ items, active, onSelect, label }: { items: RailItem[]; active: string; onSelect?: (key: string) => void; label: string }) {
  // a few items (e.g. the calculator's 3): equal cards across the full width, icon beside the name
  if (items.length <= 4) {
    return (
      <nav aria-label={label}>
        <ul className={`m-0 grid list-none gap-3 p-0 ${items.length === 2 ? "sm:grid-cols-2" : items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
          {items.map((it) => {
            const on = it.key === active;
            const Icon = ICONS[it.key] ?? PiggyBank;
            const cls = `group flex h-full w-full items-center gap-3.5 rounded-[20px] border p-4 text-left no-underline transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              on ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-brand/50 hover:bg-brand-tint"
            }`;
            const body = (
              <>
                <span
                  aria-hidden="true"
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition ${on ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}
                >
                  <Icon size={22} strokeWidth={1.9} />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className={`text-[16px] leading-snug ${on ? "font-bold text-brand" : "font-semibold text-ink"}`}>{it.label}</span>
                  {it.hint && <span className="text-[13px] leading-snug text-ink-muted">{it.hint}</span>}
                </span>
              </>
            );
            return (
              <li key={it.key}>
                {it.href ? (
                  <Link href={it.href} aria-current={on ? "page" : undefined} className={cls}>
                    {body}
                  </Link>
                ) : (
                  <button type="button" aria-pressed={on} onClick={() => onSelect?.(it.key)} className={cls}>
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label={label} className="relative border-b border-line pb-4 sm:pb-5">
      {/* phones: one row that scrolls sideways (edge to edge); wider screens: rows of 6, or one row on xl */}
      <ul className="-mx-4 m-0 flex list-none snap-x gap-1 overflow-x-auto px-4 py-1.5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-0 sm:gap-y-4 sm:overflow-visible sm:px-0 sm:py-0 [&::-webkit-scrollbar]:hidden">
        {items.map((it) => {
          const on = it.key === active;
          const name = GROUP_SHORT[it.key] ?? it.label;
          const Icon = ICONS[it.key] ?? PiggyBank;
          const cls = `group flex w-full flex-col items-center gap-2 rounded-2xl px-1 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`;
          const body = (
            <>
              <span
                aria-hidden="true"
                className={`flex h-11 w-11 items-center justify-center rounded-full transition sm:h-12 sm:w-12 ${
                  on ? "bg-brand text-white" : "bg-brand-soft text-brand group-hover:bg-sky-deep"
                }`}
              >
                <Icon size={22} strokeWidth={1.9} />
              </span>
              <span className={`whitespace-nowrap text-[12.5px] leading-none sm:text-[13.5px] ${on ? "font-bold text-brand" : "font-medium text-ink-body group-hover:text-ink"}`}>{name}</span>
            </>
          );
          return (
            <li key={it.key} className="flex w-[74px] shrink-0 snap-start justify-center sm:w-1/6 xl:w-[calc(100%/11)]">
              {it.href ? (
                <Link href={it.href} title={it.label} aria-current={on ? "page" : undefined} className={cls}>
                  {body}
                </Link>
              ) : (
                <button type="button" title={it.label} aria-pressed={on} onClick={() => onSelect?.(it.key)} className={cls}>
                  {body}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {/* phones: a soft fade at the right edge says there is more to scroll */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-4 top-0 h-[78px] w-10 bg-gradient-to-l from-surface to-transparent sm:hidden" />
    </nav>
  );
}

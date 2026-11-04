"use client";

import Link from "next/link";

import { UFoxLive } from "@/components/brand/UFoxLive";
import { PendingCard } from "@/components/dashboard/PendingCard";
import { ProductThumb } from "@/components/dashboard/ProductThumb";
import { StatCard } from "@/components/dashboard/StatCard";
import { Note } from "@/components/decor/Note";
import { Ring } from "@/components/ui/Ring";
import { useOverview } from "@/hooks/dashboard/useOverview";
import { useTaxMeter } from "@/hooks/dashboard/useTaxMeter";
import { useTransactions } from "@/hooks/dashboard/useTransactions";
import { formatBaht, formatThaiMonthYear } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import { vatThresholdDate } from "@/lib/vatThresholdDate";

const ZONE_STYLE = {
  green: { chip: "bg-success-soft text-success-ink", ring: "#34C27A", mood: "happy" },
  yellow: { chip: "bg-sun-soft text-sun-ink", ring: "#FFC83D", mood: "worried" },
  red: { chip: "bg-danger-soft text-expense", ring: "#F26B5B", mood: "shocked" },
} as const;

const PRODUCT_TINTS = ["bg-danger-soft text-danger-ink", "bg-brand-soft text-brand", "bg-success-soft text-income"];

export function ShopOverview() {
  const th = useLocale();
  const t = th.shopOverview;
  const overview = useOverview();
  const meter = useTaxMeter();
  const transactions = useTransactions(20);
  const error = overview.error ?? meter.error;

  if (error) {
    return <p className="rounded-3xl bg-danger-soft p-6 text-expense">{t.loadError}: {error.message}</p>;
  }
  if (!overview.data || !meter.data) {
    return <p className="rounded-3xl bg-surface p-6 text-center text-ink-muted">{t.loading}</p>;
  }

  const o = overview.data;
  const m = meter.data;
  const color = m.color as "green" | "yellow" | "red";
  const zone = t.zone[color];
  const style = ZONE_STYLE[color];
  const profit = Number(o.net_profit);
  const reachDate = vatThresholdDate(m);
  const pending = (transactions.data ?? []).filter((tx) => tx.status === "pending");

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="U-Fox" className="flex flex-wrap items-center gap-x-10 gap-y-7 rounded-[32px] bg-sky-deep p-6 md:p-9">
        <div className="flex min-w-0 flex-[1_1_480px] items-end gap-4">
          <UFoxLive size={140} wave mood={style.mood} tips={t.tips} bubbleSide="right" className="shrink-0 max-sm:hidden" />
          <div className="min-w-0 flex-1 rounded-3xl rounded-bl-md bg-surface px-6 py-5 shadow-[0_10px_30px_rgba(26,111,214,.12)]">
            <div className="text-[15px] font-semibold text-brand">U-Fox</div>
            <p className="m-0 text-xl leading-normal md:text-[22px]">
              {t.hello} {o.business_name} {profit >= 0 ? t.profitThisMonth : t.lossThisMonth}{" "}
              <b className={profit >= 0 ? "text-brand" : "text-expense"}>{formatBaht(Math.abs(profit))}</b> {zone.say}
            </p>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center justify-center gap-5 rounded-[28px] bg-surface px-6 py-5 max-sm:w-full md:rotate-1">
          <Note className="absolute -top-5 left-4 rounded-lg bg-sun px-2.5 py-0.5 text-[15px] !text-[#4A3500] shadow-md" tilt={-6}>
            {zone.note}
          </Note>
          <Ring ratio={Number(m.ratio)} color={style.ring} size={150}>
            <div className="text-[38px] font-bold leading-none">{Math.round(Number(m.ratio) * 100)}%</div>
            <div className="text-[13px] text-ink-muted">{t.vatThreshold}</div>
          </Ring>
          <div className="flex flex-col gap-1.5">
            <span className={`self-start rounded-full px-3 py-0.5 text-sm font-bold ${style.chip}`}>{zone.label}</span>
            <div className="text-xl font-semibold">{formatBaht(m.annual_income)}</div>
            <div className="text-[15px] text-ink-muted">
              {t.from} {formatBaht(m.threshold)} {t.inYear} {m.year + 543}
              {reachDate && (
                <>
                  <br />
                  {t.reachThreshold} {formatThaiMonthYear(reachDate)}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
        <StatCard label={t.incomeThisMonth} value={formatBaht(o.income)} />
        <StatCard label={t.expenseThisMonth} value={formatBaht(o.expense)} />
        <StatCard label={t.netProfit} value={formatBaht(o.net_profit)} highlight />
      </section>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] gap-6">
        <section className="flex flex-col gap-4 rounded-[28px] bg-surface p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 text-[21px] font-semibold">{t.bestSellers}</h2>
            <Link href="/stock" className="text-[15px] font-semibold no-underline">
              {t.viewStock}
            </Link>
          </div>
          {o.top_products.length === 0 && <p className="m-0 text-ink-muted">{t.noSales}</p>}
          {o.top_products.slice(0, 3).map((p, i) => (
            <div key={p.product_id} className="flex items-center gap-3.5">
              <ProductThumb name={p.name} rank={i + 1} tint={PRODUCT_TINTS[i]} imageUrl={p.image_url} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{p.name}</div>
                <div className="text-[15px] text-ink-muted">
                  {t.sold} {Number(p.quantity_sold).toLocaleString("en-US")} {p.unit} · {t.remaining} {Number(p.stock_qty).toLocaleString("en-US")}
                </div>
              </div>
              <b className="font-semibold">{formatBaht(p.revenue)}</b>
            </div>
          ))}
        </section>

        <PendingCard pending={pending} />
      </div>

      <Link
        href="/market"
        className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border-2 border-dashed border-sky-line bg-surface px-7 py-6 text-ink no-underline"
      >
        <span>
          <span className="block text-xl font-semibold">{t.competitorCta}</span>
          <span className="text-[15px] text-ink-muted">{t.competitorSub}</span>
        </span>
        <span className="inline-flex min-h-[48px] items-center rounded-full bg-sun px-6 font-bold text-[#4A3500]">{t.tryFree}</span>
      </Link>
    </div>
  );
}

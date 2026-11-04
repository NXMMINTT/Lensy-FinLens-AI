"use client";

import Link from "next/link";
import { useState } from "react";

import { ProductThumb } from "@/components/dashboard/ProductThumb";
import { CategoryBreakdown } from "@/components/summary/CategoryBreakdown";
import { MonthSummaryCards } from "@/components/summary/MonthSummaryCards";
import { MonthTransactionList } from "@/components/summary/MonthTransactionList";
import { useOverview } from "@/hooks/dashboard/useOverview";
import { formatBaht } from "@/lib/format";
import { useLocale } from "@/lib/i18n";

type TabId = "overview" | "income" | "expense" | "products";

const PRODUCT_TINTS = ["bg-danger-soft text-danger-ink", "bg-brand-soft text-brand", "bg-success-soft text-income"];

function monthKey(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function BestSellers({ month }: { month: string }) {
  const th = useLocale();
  const s = th.summary;
  const { data, isLoading } = useOverview(month);
  return (
    <section className="flex flex-col gap-4 rounded-[28px] bg-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-[18px] font-bold text-ink">{s.bestSellers}</h2>
        <Link href="/stock" className="text-[14px] font-semibold text-brand no-underline">
          {s.viewStock}
        </Link>
      </div>
      {isLoading && <p className="m-0 text-ink-muted">{s.loading}</p>}
      {data?.top_products.length === 0 && <p className="m-0 text-ink-muted">{s.noSales}</p>}
      {data?.top_products.map((p, i) => (
        <div key={p.product_id} className="flex items-center gap-3.5">
          <ProductThumb name={p.name} rank={i + 1} tint={PRODUCT_TINTS[i % PRODUCT_TINTS.length]} imageUrl={p.image_url} />
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{p.name}</div>
            <div className="text-[14px] text-ink-muted">
              {s.sold} {Number(p.quantity_sold).toLocaleString("en-US")} {p.unit} · {s.remaining} {Number(p.stock_qty).toLocaleString("en-US")}
            </div>
          </div>
          <b>{formatBaht(p.revenue)}</b>
        </div>
      ))}
    </section>
  );
}

export default function SummaryPage() {
  const th = useLocale();
  const s = th.summary;
  const tabs = s.tabs;
  const TABS: { id: TabId; label: string }[] = [
    { id: "overview", label: tabs.overview },
    { id: "income", label: tabs.income },
    { id: "expense", label: tabs.expense },
    { id: "products", label: tabs.products },
  ];

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const current = monthKey(year, month);
  const previous = monthKey(year, month - 1);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (isCurrentMonth) return;
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label={tabs.overview} className="flex gap-2 rounded-full bg-surface p-1 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-full py-2.5 text-[14px] font-bold transition-all ${
              activeTab === tab.id ? "bg-brand text-white shadow-sm" : "text-ink-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prevMonth}
          aria-label={s.prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-muted shadow-sm"
        >
          ‹
        </button>
        <span className="text-[16px] font-bold text-ink">
          {s.months[month]} {year + 543}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          disabled={isCurrentMonth}
          aria-label={s.nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-muted shadow-sm disabled:opacity-40"
        >
          ›
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          <MonthSummaryCards month={current} previousMonth={previous} />
          <CategoryBreakdown month={current} type="expense" />
        </>
      )}
      {(activeTab === "income" || activeTab === "expense") && (
        <>
          <CategoryBreakdown key={activeTab} month={current} type={activeTab} />
          <MonthTransactionList month={current} type={activeTab} />
        </>
      )}
      {activeTab === "products" && <BestSellers month={current} />}
    </div>
  );
}

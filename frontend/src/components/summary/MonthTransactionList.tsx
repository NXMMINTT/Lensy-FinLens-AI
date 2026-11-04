"use client";

import { useTransactions } from "@/hooks/dashboard/useTransactions";
import { formatBaht, formatThaiDate } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import type { EntryType } from "@/types/dashboard";

/** Every income or expense entry of a "YYYY-MM" month. */
export function MonthTransactionList({ month, type }: { month: string; type: EntryType }) {
  const th = useLocale();
  const { data, isLoading, error } = useTransactions(200, { month, type });
  const isIncome = type === "income";

  const mt = th.monthTransaction;

  return (
    <section className="rounded-[28px] bg-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      <h2 className="m-0 mb-4 text-[18px] font-bold text-ink">{isIncome ? mt.incomeList : mt.expenseList}</h2>
      {error && <p className="m-0 text-expense">{mt.loadError}: {error.message}</p>}
      {isLoading && <p className="m-0 text-ink-muted">{mt.loading}</p>}
      {data?.length === 0 && <p className="m-0 text-ink-muted">{isIncome ? mt.noIncome : mt.noExpense}</p>}
      <div className="flex flex-col divide-y divide-line-subtle">
        {(data ?? []).map((t) => (
          <div key={t.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{t.description ?? t.product_name ?? "-"}</div>
              <div className="text-[13px] text-ink-muted">
                {formatThaiDate(t.txn_date)} · {t.category ?? mt.noCategory}
                {t.status !== "confirmed" && ` · ${th.transactions.status[t.status]}`}
              </div>
            </div>
            <b className={isIncome ? "text-income" : "text-expense"}>
              {isIncome ? "+" : "-"}
              {formatBaht(t.amount)}
            </b>
          </div>
        ))}
      </div>
    </section>
  );
}

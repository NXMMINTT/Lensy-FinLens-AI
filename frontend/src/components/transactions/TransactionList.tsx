"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { TransactionEditForm } from "@/components/transactions/TransactionEditForm";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useTransactionActions } from "@/hooks/dashboard/useTransactionActions";
import { useTransactions } from "@/hooks/dashboard/useTransactions";
import { formatQty, formatTHB, formatThaiDate } from "@/lib/format";
import { useLocale } from "@/lib/i18n";

const STATUS_TONE = { pending: "warning", confirmed: "success", cancelled: "neutral" } as const;

/** Latest entries; pending ones can be edited (?edit=<id>, also the LINE card's "แก้ไข"), confirmed or cancelled. */
export function TransactionList() {
  const th = useLocale();
  const a = th.transactions.actions;
  const router = useRouter();
  const params = useSearchParams();
  const { data, isLoading, error } = useTransactions();
  const { confirm, cancel } = useTransactionActions();
  const editId = Number(params.get("edit")) || null;
  const editing = data?.find((t) => t.id === editId);
  const openEdit = (id: number | null) => router.replace(id ? `/transactions?edit=${id}` : "/transactions", { scroll: false });
  const actionError = confirm.error ?? cancel.error;

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 text-2xl font-bold md:text-[30px]">{th.transactions.title}</h1>
        <div className="flex gap-2">
          <Link href="/transactions?mode=income" className="inline-flex min-h-[40px] items-center rounded-full bg-income-solid px-4 text-sm font-bold text-white no-underline">
            + รายรับ
          </Link>
          <Link href="/transactions?mode=expense" className="inline-flex min-h-[40px] items-center rounded-full bg-[#FF4081] px-4 text-sm font-bold text-white no-underline">
            + รายจ่าย
          </Link>
        </div>
      </div>
      {error && <Card className="border-danger-line bg-danger-soft text-sm text-danger-ink">{error.message}</Card>}
      {actionError && <Card className="border-danger-line bg-danger-soft text-sm text-danger-ink">{actionError.message}</Card>}
      {isLoading && <Card className="text-center text-sm text-ink-muted">{th.myBusiness.loading}</Card>}
      {data?.length === 0 && <Card className="text-center text-sm text-ink-muted">{th.transactions.empty}</Card>}

      {editing && <TransactionEditForm key={editing.id} txn={editing} onClose={() => openEdit(null)} />}

      {data && data.length > 0 && (
        <Card className="flex flex-col divide-y divide-line-subtle !p-0">
          {data.map((t) => {
            const isIncome = t.type === "income";
            return (
              <div key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 md:px-6">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold">{t.description ?? "-"}</span>
                  <span className="text-xs text-ink-muted">
                    {formatThaiDate(t.txn_date)} · {t.category ?? "-"} · {th.transactions.source[t.source]}
                    {t.product_name && t.quantity && ` · ${t.product_name} ×${formatQty(t.quantity)}`}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-sm font-semibold ${isIncome ? "text-income" : "text-expense"}`}>
                    {isIncome ? "+" : "-"}
                    {formatTHB(t.amount)}
                  </span>
                  {t.status !== "confirmed" && <Badge tone={STATUS_TONE[t.status]}>{th.transactions.status[t.status]}</Badge>}
                </div>
                {t.status === "pending" && (
                  <div className="flex w-full justify-end gap-2">
                    {[
                      { label: a.edit, onClick: () => openEdit(t.id), cls: "border border-line text-ink-body" },
                      { label: a.cancel, onClick: () => cancel.mutate(t.id), cls: "border border-line text-ink-body" },
                      { label: a.confirm, onClick: () => confirm.mutate(t.id), cls: "bg-brand text-white" },
                    ].map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        onClick={b.onClick}
                        disabled={confirm.isPending || cancel.isPending}
                        className={`min-h-[36px] rounded-[10px] px-3 text-xs font-semibold disabled:opacity-50 ${b.cls}`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

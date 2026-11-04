"use client";

import { useState } from "react";

import { Card } from "@/components/ui/Card";
import { useTransactionActions } from "@/hooks/dashboard/useTransactionActions";
import { useLocale } from "@/lib/i18n";
import type { TransactionItem } from "@/types/dashboard";

const inputClass = "min-h-[44px] rounded-[10px] border border-line px-3 text-base";

/** Edit form for a pending transaction — opened from the LINE card's "แก้ไข" (LIFF) via ?edit=<id>. */
export function TransactionEditForm({ txn, onClose }: { txn: TransactionItem; onClose: () => void }) {
  const th = useLocale();
  const f = th.transactions.form;
  const a = th.transactions.actions;
  const { update, confirm } = useTransactionActions();
  const [type, setType] = useState(txn.type);
  const [amount, setAmount] = useState(String(Number(txn.amount)));
  const [description, setDescription] = useState(txn.description ?? "");
  const [txnDate, setTxnDate] = useState(txn.txn_date);
  const [product, setProduct] = useState(txn.product_name ?? "");
  const [quantity, setQuantity] = useState(txn.quantity ? String(Number(txn.quantity)) : "");
  const error = update.error ?? confirm.error;

  const save = () =>
    update.mutateAsync({
      id: txn.id,
      body: {
        type,
        amount,
        description: description || null,
        txn_date: txnDate,
        product_name: product.trim() || null,
        quantity: product.trim() && quantity ? quantity : null,
      },
    });

  return (
    <Card className="flex flex-col gap-4 border-2 border-brand">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{f.title}</h2>
        <button type="button" onClick={onClose} className="text-sm text-ink-muted">
          {a.close}
        </button>
      </div>
      {txn.status !== "pending" ? (
        <p className="text-sm text-ink-muted">{f.pendingOnly}</p>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await save();
          }}
        >
          <div role="radiogroup" aria-label={f.type} className="flex gap-2">
            {(["income", "expense"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={type === value}
                onClick={() => setType(value)}
                className={`min-h-[40px] flex-1 rounded-[10px] text-sm font-semibold ${
                  type === value
                    ? value === "income"
                      ? "bg-income-solid text-white"
                      : "bg-expense-solid text-white"
                    : "bg-line-subtle text-ink-body"
                }`}
              >
                {f[value]}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink-muted">{f.amount}</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink-muted">{f.date}</span>
              <input type="date" required value={txnDate} onChange={(e) => setTxnDate(e.target.value)} className={inputClass} />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink-muted">{f.description}</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} className={inputClass} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink-muted">{f.product}</span>
              <input value={product} onChange={(e) => setProduct(e.target.value)} maxLength={200} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink-muted">{f.quantity}</span>
              <input
                type="number"
                min="0.001"
                step="any"
                value={quantity}
                disabled={!product.trim()}
                onChange={(e) => setQuantity(e.target.value)}
                className={`${inputClass} disabled:bg-line-subtle`}
              />
            </label>
          </div>
          {error && <p className="rounded-[10px] bg-danger-soft px-3 py-2 text-sm text-danger-ink">{error.message}</p>}
          {update.isSuccess && !confirm.isSuccess && <p className="text-sm text-income">{f.saved}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={update.isPending}
              className="min-h-[44px] rounded-xl border-[1.5px] border-brand px-5 text-sm font-semibold text-brand disabled:opacity-50"
            >
              {a.save}
            </button>
            <button
              type="button"
              disabled={update.isPending || confirm.isPending}
              onClick={async () => {
                await save();
                await confirm.mutateAsync(txn.id);
                onClose();
              }}
              className="min-h-[44px] rounded-xl bg-brand px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {a.save} + {a.confirm}
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}

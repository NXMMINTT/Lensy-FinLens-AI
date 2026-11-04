"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { TransactionEntryForm } from "@/components/transactions/TransactionEntryForm";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/lib/i18n";

/**
 * /transactions                 → latest entries (pending ones can be confirmed/cancelled)
 * /transactions?edit=<id>       → same list with that pending entry open for editing (LINE card's "แก้ไข")
 * /transactions?mode=income|expense → form for a new entry (dashboard menu)
 */
function TransactionsView() {
  const params = useSearchParams();
  const mode = params.get("mode");
  if (mode === "income" || mode === "expense") return <TransactionEntryForm key={mode} mode={mode} />;
  return <TransactionList />;
}

function TransactionsLoading() {
  const th = useLocale();
  return <Card className="text-center text-sm text-ink-muted">{th.myBusiness.loading}</Card>;
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsLoading />}>
      <TransactionsView />
    </Suspense>
  );
}

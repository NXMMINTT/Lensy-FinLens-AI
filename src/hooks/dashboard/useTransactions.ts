"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { EntryType, TransactionItem } from "@/types/dashboard";

/** Latest transactions, optionally only one "YYYY-MM" month and/or one type. */
export function useTransactions(limit = 50, filter: { month?: string; type?: EntryType } = {}) {
  const query = new URLSearchParams({ limit: String(limit) });
  if (filter.month) query.set("month", filter.month);
  if (filter.type) query.set("type", filter.type);
  return useQuery({
    queryKey: ["transactions", limit, filter.month, filter.type],
    queryFn: () => apiFetch<TransactionItem[]>(`/api/v1/transactions?${query}`),
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { TransactionItem, TransactionUpdate } from "@/types/dashboard";

/** Edit / confirm / cancel a pending transaction; refreshes everything that totals depend on. */
export function useTransactionActions() {
  const queryClient = useQueryClient();
  const onSuccess = () =>
    Promise.all(
      ["transactions", "overview", "tax-meter", "products", "category-totals"].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
    );
  const post = (action: "confirm" | "cancel") => (id: number) =>
    apiFetch<TransactionItem>(`/api/v1/transactions/${id}/${action}`, { method: "POST" });

  return {
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: TransactionUpdate }) =>
        apiFetch<TransactionItem>(`/api/v1/transactions/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
      onSuccess,
    }),
    confirm: useMutation({ mutationFn: post("confirm"), onSuccess }),
    cancel: useMutation({ mutationFn: post("cancel"), onSuccess }),
  };
}

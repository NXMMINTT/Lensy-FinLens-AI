"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { TransactionCreate, TransactionItem } from "@/types/dashboard";

/** Record income/expense typed on the web; it is confirmed right away, so every total refreshes. */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TransactionCreate) =>
      apiFetch<TransactionItem>("/api/v1/transactions", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () =>
      Promise.all(
        ["transactions", "overview", "tax-meter", "products", "category-totals", "categories"].map((key) =>
          queryClient.invalidateQueries({ queryKey: [key] }),
        ),
      ),
  });
}

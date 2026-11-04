"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CategoryTotal, EntryType } from "@/types/dashboard";

/** A month's ("YYYY-MM") confirmed income or expense per category, largest first. */
export function useCategoryTotals(month: string, type: EntryType) {
  return useQuery({
    queryKey: ["category-totals", month, type],
    queryFn: () => apiFetch<CategoryTotal[]>(`/api/v1/dashboard/categories?month=${month}&type=${type}`),
  });
}

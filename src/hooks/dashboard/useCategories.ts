"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CategoryOption, EntryType } from "@/types/dashboard";

export function useCategories(type: EntryType) {
  return useQuery({
    queryKey: ["categories", type],
    queryFn: () => apiFetch<CategoryOption[]>(`/api/v1/categories?type=${type}`),
  });
}

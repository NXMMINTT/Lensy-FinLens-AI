"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { Overview } from "@/types/dashboard";

/** `month` is "YYYY-MM"; leave it out for this month to date. */
export function useOverview(month?: string) {
  return useQuery({
    queryKey: ["overview", month],
    queryFn: () => apiFetch<Overview>(`/api/v1/dashboard/overview${month ? `?month=${month}` : ""}`),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { UFoxInsights } from "@/types/market";

export function useUFoxInsights(productId: string | undefined) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["market", "ubot-insights", productId],
    queryFn: () => apiFetch<UFoxInsights>(`/api/ubot/insights?product_id=${productId}`),
    enabled: Boolean(productId),
    staleTime: 10 * 60 * 1000, // backend caches for 10 minutes too
  });
  const refresh = useMutation({
    mutationFn: () => apiFetch<UFoxInsights>(`/api/ubot/insights?product_id=${productId}&refresh=true`),
    onSuccess: (data) => queryClient.setQueryData(["market", "ubot-insights", productId], data),
  });
  return { ...query, refresh };
}

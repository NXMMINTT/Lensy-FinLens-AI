"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { Sponsor } from "@/types/market";

export function useSponsors(productId: string | undefined) {
  return useQuery({
    queryKey: ["market", "sponsors", productId],
    queryFn: () => apiFetch<Sponsor[]>(`/api/b2b/sponsors/match?product_id=${productId}`),
    enabled: Boolean(productId),
  });
}

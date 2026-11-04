"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { TaxMeter } from "@/types/dashboard";

export function useTaxMeter() {
  return useQuery({
    queryKey: ["tax-meter"],
    queryFn: () => apiFetch<TaxMeter>("/api/v1/tax/meter"),
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { BusinessInfo } from "@/types/dashboard";

export function useBusiness() {
  return useQuery({
    queryKey: ["business"],
    queryFn: () => apiFetch<BusinessInfo>("/api/v1/business"),
  });
}

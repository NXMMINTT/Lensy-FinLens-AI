"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

export function useMockQuery<T>(key: string, path: string) {
  // Keep the last product's data on screen while another product loads, so switching doesn't flash a loader.
  return useQuery({ queryKey: ["market", key], queryFn: () => apiFetch<T>(path), placeholderData: keepPreviousData });
}

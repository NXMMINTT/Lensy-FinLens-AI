"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { Subscription } from "@/types/market";

/** Plans + the current shop's status from Ball's /api/premium routes, combined for the pages. */
export function useSubscription() {
  return useQuery({
    queryKey: ["market", "subscription"],
    queryFn: async (): Promise<Subscription> => {
      const [plans, current_user] = await Promise.all([
        apiFetch<Subscription["plans"]>("/api/premium/plans"),
        apiFetch<Subscription["current_user"]>("/api/premium/status"),
      ]);
      return { plans, current_user };
    },
  });
}

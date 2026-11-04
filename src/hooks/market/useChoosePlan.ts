"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

/** Switch the shop's plan (demo backend: no payment, remembered until the server restarts). */
export function useChoosePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) =>
      apiFetch<unknown>("/api/premium/subscribe", { method: "POST", body: JSON.stringify({ plan_id: planId }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["market", "subscription"] }),
  });
}

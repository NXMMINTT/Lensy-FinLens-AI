"use client";

import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

export function useAskUFox() {
  return useMutation({
    mutationFn: (body: { question: string; product_id?: string }) =>
      apiFetch<{ answer: string }>("/api/ubot/ask", { method: "POST", body: JSON.stringify(body) }),
  });
}

"use client";

import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

/** Count a click on a sponsored listing before the browser follows its link. */
export function useRecordSponsorClick() {
  return useMutation({
    mutationFn: (listingId: string) => apiFetch<unknown>(`/api/b2b/sponsors/${listingId}/click`, { method: "POST" }),
  });
}

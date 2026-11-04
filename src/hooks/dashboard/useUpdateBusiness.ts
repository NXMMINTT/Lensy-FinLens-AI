"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { BusinessInfo, BusinessUpdate } from "@/types/dashboard";

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BusinessUpdate) =>
      apiFetch<BusinessInfo>("/api/v1/business", { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: (data) => {
      queryClient.setQueryData(["business"], data);
      return queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { resizeImage } from "@/lib/resizeImage";
import type { ProductCreate, ProductItem, ProductUpdate, StockAdjust } from "@/types/dashboard";

/** Add / edit / recount / delete products and their photo by hand; refreshes the stock list and the dashboard's best sellers. */
export function useProductActions() {
  const queryClient = useQueryClient();
  const onSuccess = () => Promise.all(["products", "overview"].map((key) => queryClient.invalidateQueries({ queryKey: [key] })));

  return {
    create: useMutation({
      mutationFn: (body: ProductCreate) => apiFetch<ProductItem>("/api/v1/products", { method: "POST", body: JSON.stringify(body) }),
      onSuccess,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: ProductUpdate }) =>
        apiFetch<ProductItem>(`/api/v1/products/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
      onSuccess,
    }),
    adjust: useMutation({
      mutationFn: ({ id, body }: { id: number; body: StockAdjust }) =>
        apiFetch<ProductItem>(`/api/v1/products/${id}/stock`, { method: "POST", body: JSON.stringify(body) }),
      onSuccess,
    }),
    uploadImage: useMutation({
      mutationFn: async ({ id, file }: { id: number; file: File }) =>
        apiFetch<ProductItem>(`/api/v1/products/${id}/image`, {
          method: "PUT",
          body: await resizeImage(file),
          headers: { "Content-Type": "image/jpeg" },
        }),
      onSuccess,
    }),
    removeImage: useMutation({
      mutationFn: (id: number) => apiFetch<ProductItem>(`/api/v1/products/${id}/image`, { method: "DELETE" }),
      onSuccess,
    }),
    remove: useMutation({
      mutationFn: (id: number) => apiFetch<void>(`/api/v1/products/${id}`, { method: "DELETE" }),
      onSuccess,
    }),
  };
}

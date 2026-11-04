import { useMockQuery } from "@/hooks/market/useMockQuery";
import type { KeywordVolume } from "@/types/market";

export const useKeywordVolume = (productId?: string) => {
  const query = productId ? `?product_id=${encodeURIComponent(productId)}` : "";
  return useMockQuery<KeywordVolume[]>(`keyword-volume${query}`, `/api/market/keyword-volume${query}`);
};

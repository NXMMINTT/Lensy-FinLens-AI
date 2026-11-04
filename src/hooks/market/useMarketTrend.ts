import { useMockQuery } from "@/hooks/market/useMockQuery";
import type { MarketTrend } from "@/types/market";

export const useMarketTrend = (productId?: string) => {
  const query = productId ? `?product_id=${encodeURIComponent(productId)}` : "";
  return useMockQuery<MarketTrend>(`trend${query}`, `/api/market/trend${query}`);
};

import { useMockQuery } from "@/hooks/market/useMockQuery";
import type { CompetitorPrices } from "@/types/market";

/** One product's competitor prices, picked by product id or by shop product name (backend defaults to the first). */
export const useCompetitorPrices = ({ productId, name }: { productId?: string; name?: string } = {}) => {
  const query = productId ? `?product_id=${encodeURIComponent(productId)}` : name ? `?name=${encodeURIComponent(name)}` : "";
  return useMockQuery<CompetitorPrices>(`competitor-prices${query}`, `/api/market/competitor-prices${query}`);
};

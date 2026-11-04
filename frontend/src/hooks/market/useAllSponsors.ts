import { useMockQuery } from "@/hooks/market/useMockQuery";
import type { Sponsor } from "@/types/market";

/** Every sponsored listing, or only those matched to one product. */
export const useAllSponsors = (productId?: string) => {
  const query = productId ? `?product_id=${encodeURIComponent(productId)}` : "";
  return useMockQuery<Sponsor[]>(`sponsors${query}`, productId ? `/api/b2b/sponsors/match${query}` : "/api/b2b/sponsors");
};

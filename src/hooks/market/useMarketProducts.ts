import { useMockQuery } from "@/hooks/market/useMockQuery";
import type { MarketProduct } from "@/types/market";

export const useMarketProducts = () => useMockQuery<MarketProduct[]>("products", "/api/market/products");

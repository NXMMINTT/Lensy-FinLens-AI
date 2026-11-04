import { useMockQuery } from "@/hooks/market/useMockQuery";
import type { TrendCatalog } from "@/types/market";

export const useTrendCatalog = () => useMockQuery<TrendCatalog>("trend-catalog", "/api/market/trend-catalog");

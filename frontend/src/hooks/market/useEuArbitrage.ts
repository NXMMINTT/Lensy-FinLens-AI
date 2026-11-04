import { useMockQuery } from "@/hooks/market/useMockQuery";
import type { EuArbitrage } from "@/types/market";

export const useEuArbitrage = () => useMockQuery<EuArbitrage[]>("eu-arbitrage", "/api/market/eu-arbitrage");

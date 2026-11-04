import { useMockQuery } from "@/hooks/market/useMockQuery";
import type { Platform } from "@/types/market";

export const usePlatforms = () => useMockQuery<Platform[]>("platforms", "/api/market/platforms");

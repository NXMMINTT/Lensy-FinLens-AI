import { useMockQuery } from "@/hooks/market/useMockQuery";
import type { Sponsor } from "@/types/market";

export const useSponsor = (listingId: string) =>
  useMockQuery<Sponsor>(`sponsor-${listingId}`, `/api/b2b/sponsors/${encodeURIComponent(listingId)}`);

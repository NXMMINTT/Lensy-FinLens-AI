import type { Competitor } from "@/types/market";

export function isAvailable(c: Competitor): boolean {
  return c.price !== null && c.stock === "มีสินค้า";
}

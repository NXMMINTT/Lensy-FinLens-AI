import { API_BASE_URL } from "@/lib/api-client";
import { productPhoto } from "@/lib/market/productPhoto";

/** The shop's uploaded photo, else a stock photo matched by name (public/products), else null. */
export function productImageSrc(imageUrl: string | null | undefined, name: string): string | null {
  if (imageUrl) return `${API_BASE_URL}${imageUrl}`;
  return productPhoto(name);
}

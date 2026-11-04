/** Keyword → real product photo, for the handful of products that have one.
 * See public/products/CREDITS.md for sourcing/license per file (Wikimedia
 * Commons, CC-licensed). Everything else uses productEmoji() instead. */
const PRODUCT_PHOTO: [string, string][] = [
  ["น้ำพริก", "/products/namprik.jpg"],
  ["พริก", "/products/namprik.jpg"],
  ["กล้วย", "/products/banana.jpg"],
  ["ชา", "/products/tea.jpg"],
  ["สบู่", "/products/soap.jpg"],
  ["กระเป๋า", "/products/bag.jpg"],
];

/** Real photo for a product name, or null to fall back to productEmoji(). */
export function productPhoto(name: string): string | null {
  const hit = PRODUCT_PHOTO.find(([kw]) => name.includes(kw));
  return hit ? hit[1] : null;
}

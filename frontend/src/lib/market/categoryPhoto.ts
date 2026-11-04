/** Market Radar categories (C01–C20) that have a real product photo instead
 * of just the category SVG glyph — see public/products/CREDITS.md. */
const CATEGORY_PHOTO = new Set([
  "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10",
  "C11", "C13", "C14", "C16", "C18", "C20",
]);

export function categoryPhoto(categoryId: string): string | null {
  return CATEGORY_PHOTO.has(categoryId) ? `/products/${categoryId}.jpg` : null;
}

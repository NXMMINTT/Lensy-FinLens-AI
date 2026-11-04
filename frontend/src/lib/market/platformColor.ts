/** Fixed colors per platform so the same platform reads the same in every chart.
 * Validated with the dataviz skill's validate_palette.js (light mode, all pairs): all checks pass;
 * the orange is < 3:1 on white, so lines also carry direct labels. */
export const PLATFORM_COLORS: Record<string, string> = {
  Shopee: "#1F5FBF",
  Lazada: "#14A0B8",
  "TikTok Shop": "#D9891A",
  Thaimart: "#C2416B",
  Amazon: "#7A5C00",
};

export const FALLBACK_COLOR = "#5A667A";

export function platformColor(name: string): string {
  return PLATFORM_COLORS[name] ?? FALLBACK_COLOR;
}

const LOGOS: Record<string, string> = {
  shopee: "/logos/shopee.webp",
  lazada: "/logos/lazada.jpg",
  amazon: "/logos/amazon.jpg",
  ebay: "/logos/ebay.png",
  thaimart: "/logos/thaimart.jpg",
  // Brand marks below are Simple Icons (CC0) SVGs, not official downloads —
  // see mock-data/README.md for platforms that don't have one (letter badge instead).
  tiktok: "/logos/tiktok.svg",
  line: "/logos/line.svg",
  facebook: "/logos/facebook.svg",
  instagram: "/logos/instagram.svg",
  grab: "/logos/grab.svg",
  bukalapak: "/logos/bukalapak.svg",
  etsy: "/logos/etsy.svg",
  walmart: "/logos/walmart.svg",
  target: "/logos/target.svg",
  aliexpress: "/logos/aliexpress.svg",
  alibaba: "/logos/alibaba.svg",
  wish: "/logos/wish.svg",
  zalando: "/logos/zalando.svg",
  otto: "/logos/otto.svg",
  allegro: "/logos/allegro.svg",
  rakuten: "/logos/rakuten.svg",
  yahoo: "/logos/yahoo.svg",
  taobao: "/logos/taobao.svg",
  flipkart: "/logos/flipkart.svg",
  blibli: "/logos/blibli.svg",
};

/** Logo for a platform id like "shopee_th" / "amazon_us", or null for a letter badge. */
export function platformLogo(platformIdOrName: string): string | null {
  const key = platformIdOrName.toLowerCase().replace(/[^a-z].*$/, "");
  return LOGOS[key] ?? null;
}

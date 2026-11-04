// Market Radar routes serve mock-data/*.json as-is (backend/app/routers/market_radar.py etc.),
// so they aren't in the OpenAPI schema — these types mirror mock-data/README.md.
export type Competitor = {
  platform_id: string;
  platform: string;
  seller: string;
  price: number | null;
  currency: string;
  stock: string;
};

export type MarketProduct = { product_id: string; product_name: string };

export type CompetitorPrices = {
  product_id: string;
  product_name: string;
  my_cost_price: number;
  my_selling_price: number;
  competitors: Competitor[];
  price_distribution_thb: { min: number; p25: number; median: number; p75: number; max: number };
};

export type MarketTrend = {
  product_id: string;
  product_name: string;
  granularity: string;
  series: { platform: string; points: { week: string; units_sold: number }[] }[];
};

export type KeywordVolume = { product_id: string; keyword: string; platform: string; search_volume: number; trend: "up" | "down" | "stable" };

export type EuArbitrage = {
  product_id: string;
  product_name: string;
  thailand_avg_price_thb: number;
  eu_market: {
    region: string;
    avg_retail_price_eur: number;
    suggested_wholesale_price_eur: number;
    demand_score: number;
    demand_note: string;
  };
};

/** /api/ubot/insights — Gemini recommendations + Dynamic Pricing, with a rule-based fallback. */
export type UFoxInsights = {
  product_id: string;
  rule_price: number;
  suggested_price: number;
  reason: string;
  insights: string[];
  generated_by: "gemini" | "rules";
};

export type Sponsor = {
  listing_id: string;
  sponsor_name: string;
  sponsor_type: string;
  product_name: string;
  description: string;
  price: number;
  unit: string;
  moq: number;
  target_product_ids: string[];
  cta_link: string;
};

export type Platform = { platform_id: string; name: string; region: string; type: string };

export type Subscription = {
  plans: {
    plan_id: string;
    name: string;
    price_thb_per_month: number;
    trial_days?: number;
    features: string[];
  }[];
  current_user: {
    shop_name: string;
    plan_id: string;
    status: string;
    is_premium: boolean;
    days_left_in_trial: number | null;
    next_billing_date: string | null;
    next_billing_amount_thb: number | null;
    payment_method: { label: string } | null;
    banner: { type: string; message: string } | null;
  };
};

export type CatalogPlatform = { id: string; name: string; intl: boolean; description: string };

export type CatalogProduct = {
  product_id: string;
  category_id: string;
  name: string;
  base_price: number;
  search_growth_pct: number;
  sold_per_month: number;
  peak_in_days: number;
  /** 8 weeks of search interest + 2 forecast weeks */
  search_index: number[];
  prices: { platform_id: string; available: boolean; price: number | null; shops: number }[];
  offers: {
    platform_id: string;
    seller: string;
    price: number;
    shipping: number;
    discount: number;
    rating: number;
    sold: number;
    delivery: string;
    match_pct: number;
  }[];
  price_history: { weeks: string[]; series: Record<string, number[]> };
};

export type TrendCatalog = {
  platforms: CatalogPlatform[];
  categories: { category_id: string; name: string; icon_path: string }[];
  products: CatalogProduct[];
};

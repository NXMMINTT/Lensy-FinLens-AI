"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { CategoryThumb } from "@/components/market/CategoryThumb";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useTrendCatalog } from "@/hooks/market/useTrendCatalog";
import type { CatalogProduct } from "@/types/market";
import { loadPickedPlatforms } from "@/lib/market/pickedPlatforms";
import { formatGrowth, TREND_STATUS_TONE, type TrendStatus, trendStatus } from "@/lib/market/trendStatus";
import { useLocale } from "@/lib/i18n";

const baht = (n: number) => `฿${Math.round(n).toLocaleString("en-US")}`;
const DEFAULT_CHIPS = 6;
const VISIBLE_CHIPS = 5;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-[40px] flex-none whitespace-nowrap rounded-full border px-4 text-[15px] ${
        active ? "border-brand bg-brand font-semibold text-white" : "border-line bg-surface text-ink-body hover:border-brand hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}

function TrendsView() {
  const th = useLocale();
  const t = th.marketRadar.trends;
  const router = useRouter();
  const params = useSearchParams();
  const catalog = useTrendCatalog();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [tab, setTab] = useState<"hot" | "rising">("hot");
  const [pf, setPf] = useState("all");
  const [picked, setPicked] = useState<string[] | null>(null);
  const catId = params.get("cat");

  useEffect(() => setPicked(loadPickedPlatforms()), []);

  if (catalog.error) return <Card className="border-danger-line bg-danger-soft text-sm text-danger-ink">{catalog.error.message}</Card>;
  if (!catalog.data) return <Card className="text-center text-sm text-ink-muted">{th.myBusiness.loading}</Card>;

  const { categories, products } = catalog.data;
  // Picked on /market/platforms; until then show the first few (Thai majors) so the chip row stays short.
  const platforms = picked?.length ? catalog.data.platforms.filter((p) => picked.includes(p.id)) : catalog.data.platforms.slice(0, DEFAULT_CHIPS);
  // However many are picked, only the first few get a chip so the row stays on one line; the rest sit in
  // one "อื่น ๆ" dropdown (not worth it for a single leftover platform).
  const chipPlatforms = platforms.length > VISIBLE_CHIPS + 1 ? platforms.slice(0, VISIBLE_CHIPS) : platforms;
  const morePlatforms = platforms.slice(chipPlatforms.length);
  const moreActive = morePlatforms.find((p) => p.id === pf);
  const catOf = (p: CatalogProduct) => categories.find((c) => c.category_id === p.category_id)!;
  const category = categories.find((c) => c.category_id === catId);
  const query = q.trim();

  const results = !query
    ? []
    : [
        ...categories
          .filter((c) => c.name.includes(query))
          .map((c) => ({
            key: c.category_id,
            href: `/market/trends?cat=${c.category_id}`,
            name: c.name,
            sub: t.categorySub.replace("{count}", String(products.filter((p) => p.category_id === c.category_id).length)),
            cat: c,
          })),
        ...products
          .filter((p) => p.name.includes(query))
          .map((p) => ({
            key: p.product_id,
            href: `/market/products/${p.product_id}`,
            name: p.name,
            sub: `${catOf(p).name} · ${t.status[trendStatus(p.search_growth_pct)]}`,
            cat: catOf(p),
          })),
      ].slice(0, 8);

  const priceCell = (p: CatalogProduct) => {
    const visible = p.prices.filter((x) => platforms.some((pl) => pl.id === x.platform_id));
    if (pf === "all") {
      const ps = visible.filter((x) => x.available).map((x) => x.price!);
      return {
        caption: t.priceRange.replace("{count}", String(ps.length)),
        price: ps.length ? `${baht(Math.min(...ps))} – ${baht(Math.max(...ps))}` : t.notSold,
      };
    }
    const x = p.prices.find((y) => y.platform_id === pf);
    const name = platforms.find((pl) => pl.id === pf)?.name ?? pf;
    return { caption: t.priceOn.replace("{platform}", name), price: x?.available ? baht(x.price!) : t.notSold };
  };

  return (
    <div className="flex flex-col gap-[22px]">
      {category && (
        <nav aria-label="ตำแหน่งหน้า" className="flex flex-wrap items-center gap-1.5 text-sm text-ink-faint">
          <Link href="/market/trends" className="hover:text-brand">
            {t.allCategories}
          </Link>
          <span aria-hidden="true">›</span>
          <span className="text-ink-body">{category.name}</span>
        </nav>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-2xl font-bold md:text-[28px]">{category?.name ?? t.title}</h2>
        <p className="m-0 text-sm text-ink-muted">{t.statusLegend}</p>
        {!category && (
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className="min-h-[54px] w-full rounded-full border-2 border-sky-line bg-surface px-6 pr-24 text-[17px] shadow-[0_10px_24px_rgba(26,111,214,.08)] focus:border-brand"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-brand"
              >
                {t.clear}
              </button>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="กรองตามแพลตฟอร์ม" className="-mx-4 flex min-w-0 flex-1 gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
            <Chip active={pf === "all"} onClick={() => setPf("all")}>
              {t.allPlatforms}
            </Chip>
            {chipPlatforms.map((p) => (
              <Chip key={p.id} active={pf === p.id} onClick={() => setPf(p.id)}>
                {p.name}
              </Chip>
            ))}
            {morePlatforms.length > 0 && (
              // A chip-shaped label with an invisible native <select> over it: sized to its text (a bare
              // <select> is as wide as its longest option) and still opens the native picker.
              <label
                className={`relative inline-flex min-h-[40px] flex-none items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[15px] ${
                  moreActive ? "border-brand bg-brand font-semibold text-white" : "border-line bg-surface text-ink-body hover:border-brand hover:text-brand"
                }`}
              >
                <span className="max-w-[180px] truncate">{moreActive ? moreActive.name : `อื่น ๆ (+${morePlatforms.length})`}</span>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
                <select
                  aria-label="แพลตฟอร์มอื่น"
                  value={moreActive ? pf : ""}
                  onChange={(e) => e.target.value && setPf(e.target.value)}
                  className="absolute inset-0 cursor-pointer appearance-none opacity-0"
                >
                  <option value="">อื่น ๆ</option>
                  {morePlatforms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <Link href="/market/platforms" className="flex-none text-sm font-semibold text-brand no-underline hover:underline">
            จัดการแพลตฟอร์ม
          </Link>
        </div>
      </div>

      {query && (
        <Card className="flex flex-col gap-1">
          {results.length === 0 ? (
            <p className="text-sm text-ink-muted">{t.noResults}</p>
          ) : (
            results.map((r) => (
              <Link key={r.key} href={r.href} className="flex items-center gap-3 rounded-[10px] px-2 py-2 hover:bg-line-subtle">
                <CategoryThumb categoryId={r.cat.category_id} path={r.cat.icon_path} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{r.name}</span>
                  <span className="block text-xs text-ink-muted">{r.sub}</span>
                </span>
              </Link>
            ))
          )}
        </Card>
      )}

      {!category && !query && <ForecastOverview products={products} catOf={catOf} />}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t.categoriesTitle}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <button
              key={c.category_id}
              type="button"
              onClick={() => router.push(`/market/trends?cat=${c.category_id}`)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-center text-sm font-medium hover:border-brand"
            >
              <CategoryThumb categoryId={c.category_id} path={c.icon_path} size={52} />
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {category && (
        <Card className="flex flex-col gap-3">
          <div role="tablist" className="flex gap-2">
            {(["hot", "rising"] as const).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`min-h-[40px] rounded-[10px] px-[18px] text-sm font-semibold ${tab === key ? "bg-brand text-white" : "bg-line-subtle text-ink-body"}`}
              >
                {key === "hot" ? t.tabHot : t.tabRising}
              </button>
            ))}
          </div>
          <ol className="flex flex-col">
            {products
              .filter((p) => p.category_id === category.category_id)
              .sort((a, b) => (tab === "hot" ? b.sold_per_month - a.sold_per_month : b.search_growth_pct - a.search_growth_pct))
              .map((p, i) => {
                const status = trendStatus(p.search_growth_pct);
                const cell = priceCell(p);
                return (
                  <li key={p.product_id} className="border-t border-line-subtle first:border-t-0">
                    <Link
                      href={`/market/products/${p.product_id}`}
                      className="flex flex-wrap items-center gap-3 py-3 hover:bg-line-subtle"
                    >
                      <span className="w-6 text-center text-lg font-bold text-ink-faint">{i + 1}</span>
                      <CategoryThumb categoryId={p.category_id} path={category.icon_path} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{p.name}</span>
                          <Badge tone={TREND_STATUS_TONE[status]}>{t.status[status]}</Badge>
                        </div>
                        <div className="text-xs text-ink-muted">
                          {t.soldPerMonth.replace("{sold}", p.sold_per_month.toLocaleString("en-US"))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-ink-muted">{cell.caption}</div>
                        <div className="font-semibold">{cell.price}</div>
                        <div className={`text-xs font-semibold ${p.search_growth_pct >= 0 ? "text-income" : "text-ink-faint"}`}>
                          {formatGrowth(p.search_growth_pct)}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
          </ol>
        </Card>
      )}
    </div>
  );
}

function LoadingFallback() {
  const th = useLocale();
  return <Card className="text-center text-sm text-ink-muted">{th.myBusiness.loading}</Card>;
}

export default function TrendsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TrendsView />
    </Suspense>
  );
}

/* ---------- forecast overview (top) ---------- */

/* ---------- forecast overview (mock style) ---------- */

/** Price series synthesized from the real price range: one point per day.
 *  Days 0–9 rise from below the cheapest offer up past the priciest (solid line);
 *  days 9–14 fan out into an upper/lower forecast band (dashed lines). */
function priceSeries(p: CatalogProduct): { now: number[]; upper: number[]; lower: number[] } {
  const ps = p.prices.filter((x) => x.available).map((x) => x.price!);
  const min = ps.length ? Math.min(...ps) : p.base_price * 0.9;
  const max = ps.length ? Math.max(...ps) : p.base_price * 1.1;
  const seed = [...p.product_id].reduce((s, c) => s + c.charCodeAt(0), 0);
  const start = min * 0.8;
  const end = max * 1.08;
  const now = Array.from({ length: 10 }, (_, i) => {
    const k = i / 9;
    const eased = 1 - (1 - k) ** 1.6; // fast at first, then flattening — like the mock
    const wobble = i === 0 || i === 9 ? 0 : Math.sin(i * 1.9 + seed) * (max - min + 10) * 0.05;
    return Math.round(start + (end - start) * eased + wobble);
  });
  const last = now[9];
  const upper = Array.from({ length: 6 }, (_, i) => Math.round(last * (1 + 0.11 * (i / 5))));
  const lower = Array.from({ length: 6 }, (_, i) => Math.round(last * (1 - 0.05 * Math.sin((i / 5) * Math.PI)) + last * 0.03 * (i / 5)));
  return { now, upper, lower };
}

const CARD_TONE = {
  rank: "bg-[#2F7CF6]",
  badge: "bg-[#2F7CF6] text-white",
  line: "#2F7CF6",
  fill: "rgba(47,124,246,.16)",
} as const;

function ForecastOverview({
  products,
  catOf,
}: {
  products: CatalogProduct[];
  catOf: (p: CatalogProduct) => { name: string; icon_path: string };
}) {
  const th = useLocale();
  const t = th.marketRadar.trends;
  const ranked = [...products].sort((a, b) => b.search_growth_pct - a.search_growth_pct);
  const top6 = ranked.slice(0, 6);
  const countWith = (status: TrendStatus) => products.filter((p) => trendStatus(p.search_growth_pct) === status).length;
  const summary = [
    { label: `🔥 ${t.status.hot}`, value: countWith("hot") },
    { label: t.status.rising, value: countWith("rising") },
    { label: t.summaryTotal, value: products.length },
  ];

  const statusTone: Record<string, string> = { hot: "text-expense", rising: "text-brand", stable: "text-success-ink" };
  void statusTone;

  return (
    <div className="flex flex-col gap-5">
      {/* hero */}
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="grid h-14 w-14 flex-none place-items-center rounded-full bg-[#FFF1E6] dark:bg-[#431407] text-[28px] leading-none">
          🔥
        </span>
        <div>
          <h2 className="m-0 text-2xl font-bold leading-tight text-ink md:text-[28px]">{t.forecastTitle}</h2>
          <p className="m-0 mt-1 text-[15px] text-ink-muted">{t.forecastSub}</p>
        </div>
      </div>

      {/* how many products sit in each trend bucket */}
      <dl className="m-0 grid grid-cols-3 gap-3">
        {summary.map((s) => (
          <div key={s.label} className="rounded-[20px] bg-surface px-4 py-4 shadow-[0_4px_16px_rgba(26,111,214,.06)] md:px-5">
            <dt className="text-[15px] text-ink-muted">{s.label}</dt>
            <dd className="m-0 text-[26px] font-bold leading-tight text-ink">
              {s.value.toLocaleString("en-US")} <span className="text-[15px] font-normal text-ink-muted">{t.productsUnit}</span>
            </dd>
          </div>
        ))}
      </dl>

      {/* 6 product cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {top6.map((p, i) => (
          <TrendCard key={p.product_id} product={p} rank={i + 1} tone={CARD_TONE} catOf={catOf} />
        ))}
      </div>
    </div>
  );
}

/* ---------- line-icon set ---------- */

const Icon = {
  Hourglass: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 3h10M7 21h10M7 3c0 5 10 5 10 9S7 16 7 21M17 3c0 5-10 5-10 9" />
    </svg>
  ),
};

/* ---------- product trend card ---------- */

function TrendCard({
  product: p,
  rank,
  tone,
  catOf,
}: {
  product: CatalogProduct;
  rank: number;
  tone: typeof CARD_TONE;
  catOf: (p: CatalogProduct) => { name: string; icon_path: string };
}) {
  const t = useLocale().marketRadar.trends;
  const status = trendStatus(p.search_growth_pct);
  const series = priceSeries(p);
  const ps = p.prices.filter((x) => x.available).map((x) => x.price!);
  const min = ps.length ? Math.min(...ps) : p.base_price;
  const max = ps.length ? Math.max(...ps) : p.base_price;

  return (
    <div className="flex flex-col rounded-[22px] bg-surface p-5 shadow-[0_4px_16px_rgba(26,111,214,.06)]">
      {/* header: rank + status badge */}
      <div className="flex items-center gap-2.5">
        <span className={`grid h-9 w-9 flex-none place-items-center rounded-full text-[16px] font-bold text-white ${tone.rank}`}>{rank}</span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[14px] font-bold ${tone.badge}`}>
          {status === "hot" ? <span aria-hidden="true">🔥</span> : <Icon.Hourglass />} {t.status[status]}
        </span>
      </div>

      {/* product row */}
      <div className="mt-3 flex items-start gap-3">
        <Link href={`/market/products/${p.product_id}`} aria-label={p.name}>
          <CategoryThumb categoryId={p.category_id} path={catOf(p).icon_path} size={72} className="!rounded-2xl" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/market/products/${p.product_id}`}
            className="block text-[22px] font-bold leading-tight text-ink no-underline hover:text-brand hover:underline"
          >
            {p.name}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-ink-muted">
            <span className="truncate">{catOf(p).name}</span>
            <span aria-hidden="true">·</span>
            <span>
              {t.growthCaption} <span className="font-semibold text-ink-body">↑ {formatGrowth(p.search_growth_pct)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* price forecast — small outlined chip, not a loud bubble */}
      <div className="mt-3 flex justify-end pr-1">
        <span
          className="inline-flex items-baseline gap-1.5 rounded-md border px-2 py-0.5 text-[12px]"
          style={{ borderColor: tone.line, color: tone.line }}
        >
          <span className="opacity-80">{t.forecastBadge2}</span>
          <span className="font-semibold">
            {baht(min)} – {baht(max)}
          </span>
        </span>
      </div>

      {/* chart: solid now-line + dashed forecast + y labels + x labels */}
      <PriceChart {...series} color={tone.line} />

      {/* legend */}
      <div className="mt-1 flex items-center justify-center gap-5 text-[13px] text-ink-body">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-[3px] w-5 rounded-full" style={{ background: tone.line }} aria-hidden="true" />
          {t.chartNow}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-[3px] w-5 rounded-full opacity-60" style={{ background: `repeating-linear-gradient(90deg, ${tone.line} 0 4px, transparent 4px 7px)` }} aria-hidden="true" />
          {t.chartForecast}
        </span>
      </div>

      {/* mini stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-brand-tint p-2.5">
        <MiniStat label={t.miniStart} value={baht(min)} />
        <MiniStat label={t.miniRange} value={`${baht(min)} – ${baht(max)}`} />
        <div className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-success-soft px-2 py-2 text-center">
          <span className="truncate text-[12px] leading-tight text-success-ink">แนวโน้ม</span>
          <b className="whitespace-nowrap text-[15px] leading-tight text-success-ink">
            {status === "hot" ? "⤴ เพิ่มขึ้น" : status === "rising" ? "↑ เพิ่มขึ้น" : "→ ทรงตัว"}
          </b>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-surface px-2 py-2 text-center">
      <span className="truncate text-[12px] leading-tight text-ink-muted">{label}</span>
      <b className="whitespace-nowrap text-[15px] leading-tight text-ink">{value}</b>
    </div>
  );
}

/** Line chart with y/x axis labels, dots on the now-line and a dashed forecast continuation. */
function PriceChart({
  now,
  upper,
  lower,
  color,
}: {
  now: number[];
  upper: number[];
  lower: number[];
  color: string;
}) {
  const w = 320;
  const h = 135;
  const padL = 38;
  const allValues = [...now, ...upper, ...lower];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const lo = Math.floor(minVal / 10) * 10;
  const hi = Math.ceil(maxVal / 10) * 10;
  const span = hi - lo || 1;

  const totalPoints = now.length + upper.length - 1;
  const x = (i: number) => padL + ((w - padL - 10) * i) / (totalPoints - 1);
  const y = (v: number) => h - 22 - ((h - 38) * (v - lo)) / span;

  const nowPts = now.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const fcStart = now.length - 1;

  const upperPts = upper.map((v, i) => `${x(fcStart + i).toFixed(1)},${y(v).toFixed(1)}`);
  const lowerPts = lower.map((v, i) => `${x(fcStart + i).toFixed(1)},${y(v).toFixed(1)}`);

  // Forecast band polygon (shaded between upper and lower forecast)
  const bandPolygon = [
    ...upperPts,
    ...[...lowerPts].reverse(),
  ].join(" ");

  // Y axis ticks (3-4 ticks max to keep uncluttered and compact)
  const step = Math.max(10, Math.ceil((hi - lo) / 3 / 10) * 10);
  const yTicks: number[] = [];
  for (let v = lo; v <= hi; v += step) yTicks.push(v);
  if (!yTicks.includes(hi) && hi - yTicks[yTicks.length - 1] > step * 0.4) {
    yTicks.push(hi);
  }

  const xTicks = [
    { i: 0, label: "วันนี้" },
    { i: Math.round((now.length - 1) * 0.7), label: "7 วัน" },
    { i: totalPoints - 1, label: "14 วัน" },
  ];
  const gid = `pc-${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 w-full" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* horizontal subtle gridlines */}
      {yTicks.map((v) => (
        <line key={v} x1={padL} x2={w - 6} y1={y(v)} y2={y(v)} stroke="rgb(var(--line-subtle))" strokeWidth="1" />
      ))}

      {/* Y axis labels */}
      {yTicks.map((v) => (
        <text key={v} x={2} y={y(v) + 3.5} fontSize="10" fill="#9AA5B5">
          ฿{Math.round(v)}
        </text>
      ))}

      {/* Shaded area under solid line */}
      <polygon
        points={`${x(0).toFixed(1)},${h - 22} ${nowPts.join(" ")} ${x(fcStart).toFixed(1)},${h - 22}`}
        fill={`url(#${gid})`}
      />

      {/* Forecast fan shading */}
      <polygon points={bandPolygon} fill={color} opacity="0.10" />

      {/* Solid now-line */}
      <polyline points={nowPts.join(" ")} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Dashed forecast lines (upper and lower bounds) */}
      <polyline points={upperPts.join(" ")} fill="none" stroke={color} strokeWidth="1.8" strokeDasharray="4 3" opacity="0.8" strokeLinejoin="round" />
      <polyline points={lowerPts.join(" ")} fill="none" stroke={color} strokeWidth="1.8" strokeDasharray="4 3" opacity="0.8" strokeLinejoin="round" />

      {/* End dots on forecast */}
      <circle cx={x(totalPoints - 1)} cy={y(upper[upper.length - 1])} r="3" fill={color} />
      <circle cx={x(totalPoints - 1)} cy={y(lower[lower.length - 1])} r="3" fill={color} />

      {/* Dots on now line */}
      {now.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="2.2" fill={color} />
      ))}

      {/* X axis labels */}
      {xTicks.map((tk) => (
        <text key={tk.label} x={x(tk.i)} y={h - 6} fontSize="10" fill="#9AA5B5" textAnchor={tk.i === 0 ? "start" : tk.i === totalPoints - 1 ? "end" : "middle"}>
          {tk.label}
        </text>
      ))}
    </svg>
  );
}

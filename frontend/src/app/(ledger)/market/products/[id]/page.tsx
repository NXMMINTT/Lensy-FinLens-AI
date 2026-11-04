"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { CategoryThumb } from "@/components/market/CategoryThumb";
import { PlatformBadge } from "@/components/market/PlatformBadge";
import { PriceHistoryChart } from "@/components/market/PriceHistoryChart";
import { SearchTrendChart } from "@/components/market/SearchTrendChart";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useTrendCatalog } from "@/hooks/market/useTrendCatalog";
import { formatGrowth, TREND_STATUS_TONE, trendStatus } from "@/lib/market/trendStatus";
import { useLocale } from "@/lib/i18n";

const baht = (n: number) => `฿${Math.round(n).toLocaleString("en-US")}`;
type Sort = "total" | "sold" | "rating";
const TOP_ROWS = 10;

export default function ProductPage() {
  const th = useLocale();
  const t = th.marketRadar.product;
  const { id } = useParams<{ id: string }>();
  const catalog = useTrendCatalog();
  const [sort, setSort] = useState<Sort>("total");
  const [sell, setSell] = useState<number | null>(null);
  const [fee, setFee] = useState(10);
  const [showAll, setShowAll] = useState(false);

  if (catalog.error) return <Card className="border-danger-line bg-danger-soft text-sm text-danger-ink">{catalog.error.message}</Card>;
  if (!catalog.data) return <Card className="text-center text-sm text-ink-muted">{th.myBusiness.loading}</Card>;

  const p = catalog.data.products.find((x) => x.product_id === id);
  if (!p) return <Card className="text-center text-sm text-ink-muted">{t.notFound}</Card>;

  const category = catalog.data.categories.find((c) => c.category_id === p.category_id)!;
  const platformName = (pid: string) => catalog.data.platforms.find((x) => x.id === pid)?.name ?? pid;
  const status = trendStatus(p.search_growth_pct);

  const offers = p.offers.map((o) => ({ ...o, total: o.price + o.shipping - o.discount, name: platformName(o.platform_id) }));
  const sorted = [...offers].sort((a, b) =>
    sort === "total" ? a.total - b.total : sort === "sold" ? b.sold - a.sold : b.rating - a.rating,
  );
  const best = offers.reduce((m, o) => (o.total < m.total ? o : m), offers[0]);
  const worst = offers.reduce((m, o) => (o.total > m.total ? o : m), offers[0]);
  const save = worst.total - best.total;

  // NIGHT's insight rule: a >= 20% price gap is an arbitrage opportunity, otherwise compete on service.
  const avail = p.prices.filter((x) => x.available);
  const lo = avail.reduce((m, x) => (x.price! < m.price! ? x : m), avail[0]);
  const hi = avail.reduce((m, x) => (x.price! > m.price! ? x : m), avail[0]);
  const gapPct = Math.round(((hi.price! - lo.price!) / lo.price!) * 100);
  const insight =
    gapPct >= 20
      ? t.insightGap
          .replace("{gap}", String(gapPct))
          .replace("{low}", platformName(lo.platform_id))
          .replace("{high}", platformName(hi.platform_id))
          .replace("{baht}", baht(hi.price! - lo.price!))
      : t.insightFlat;

  const sellPrice = sell ?? Math.round(best.total * 1.3);
  const feeBaht = (sellPrice * (fee || 0)) / 100;
  const profit = sellPrice - best.total - feeBaht;

  return (
    <div className="flex flex-col gap-[22px]">
      <nav aria-label="ตำแหน่งหน้า" className="flex flex-wrap items-center gap-1.5 text-sm text-ink-faint">
        <Link href="/market/trends" className="hover:text-brand">
          {th.marketRadar.trends.allCategories}
        </Link>
        <span aria-hidden="true">›</span>
        <Link href={`/market/trends?cat=${category.category_id}`} className="hover:text-brand">
          {category.name}
        </Link>
        <span aria-hidden="true">›</span>
        <span className="text-ink-body">{p.name}</span>
      </nav>

      <Card className="flex flex-wrap gap-6">
        <CategoryThumb categoryId={category.category_id} path={category.icon_path} size={120} className="rounded-2xl" />
        <div className="flex min-w-0 flex-[999_1_320px] flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={TREND_STATUS_TONE[status]}>{th.marketRadar.trends.status[status]}</Badge>
            <Badge tone="neutral">{category.name}</Badge>
            <span className="text-[13px] text-ink-faint">
              {t.foundIn
                .replace("{platforms}", String(avail.length))
                .replace("{shops}", String(avail.reduce((s, x) => s + x.shops, 0)))}
            </span>
          </div>
          <h2 className="text-2xl font-bold leading-snug md:text-[30px]">{p.name}</h2>
          <p className="text-ink-muted">
            {t.summary
              .replace("{growth}", formatGrowth(p.search_growth_pct))
              .replace("{sold}", p.sold_per_month.toLocaleString("en-US"))}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-success-soft px-4 py-3.5 text-success-ink">
              <div className="text-xs">{t.bestTotal}</div>
              <div className="text-[22px] font-bold">{baht(best.total)}</div>
              <div className="text-xs">{best.name}</div>
            </div>
            <div className="rounded-xl bg-line-subtle px-4 py-3.5 text-ink-body">
              <div className="text-xs">{t.worstTotal}</div>
              <div className="text-[22px] font-bold text-ink">{baht(worst.total)}</div>
              <div className="text-xs">{worst.name}</div>
            </div>
            <div className="rounded-xl bg-brand-soft px-4 py-3.5 text-brand-dark dark:text-brand-light">
              <div className="text-xs">{t.maxSave}</div>
              <div className="text-[22px] font-bold">{baht(save)}</div>
              <div className="text-xs">{worst.total ? `${Math.round((save / worst.total) * 100)}%` : ""}</div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t.compareTitle}</h2>
            <p className="text-xs text-ink-muted">{t.totalFormula}</p>
          </div>
          <div role="group" className="flex flex-wrap gap-2">
            {(
              [
                ["total", t.sortTotal],
                ["sold", t.sortSold],
                ["rating", t.sortRating],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={sort === key}
                onClick={() => setSort(key)}
                className={`min-h-[36px] rounded-[10px] px-3 text-sm ${sort === key ? "bg-navy font-semibold text-white" : "border border-line bg-surface text-ink-body"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="bg-line-subtle text-left text-xs text-ink-muted">
                <th className="px-3.5 py-3 font-semibold">{t.colPlatform}</th>
                <th className="px-3.5 py-3 font-semibold">{t.colMatch}</th>
                <th className="px-3.5 py-3 text-right font-semibold">{t.colPrice}</th>
                <th className="px-3.5 py-3 text-right font-semibold">{t.colShip}</th>
                <th className="px-3.5 py-3 text-right font-semibold">{t.colCode}</th>
                <th className="px-3.5 py-3 text-right font-semibold">{t.colTotal}</th>
                <th className="px-3.5 py-3 font-semibold">{t.colRating}</th>
                <th className="px-3.5 py-3 font-semibold">{t.colDelivery}</th>
              </tr>
            </thead>
            <tbody>
              {(showAll ? sorted : sorted.slice(0, TOP_ROWS)).map((o) => {
                const isBest = o.platform_id === best.platform_id;
                return (
                  <tr key={o.platform_id} className={`border-t border-line ${isBest ? "bg-success-soft" : ""}`}>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <PlatformBadge id={o.platform_id} name={o.name} />
                        <div>
                          <div className="font-semibold">{o.name}</div>
                          <div className="text-xs text-ink-muted">{o.seller}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <Badge tone="info">{t.matchPct.replace("{pct}", String(o.match_pct))}</Badge>
                    </td>
                    <td className="px-3.5 py-3 text-right">{baht(o.price)}</td>
                    <td className="px-3.5 py-3 text-right text-ink-muted">{o.shipping ? `+${baht(o.shipping)}` : t.freeShip}</td>
                    <td className="px-3.5 py-3 text-right text-ink-muted">{o.discount ? `−${baht(o.discount)}` : "–"}</td>
                    <td className="px-3.5 py-3 text-right">
                      <b>{baht(o.total)}</b>
                      {isBest && (
                        <div>
                          <Badge tone="success">{t.best}</Badge>
                        </div>
                      )}
                    </td>
                    <td className="px-3.5 py-3 text-ink-body">
                      ★ {o.rating.toFixed(1)} · {o.sold.toLocaleString("en-US")} ชิ้น
                    </td>
                    <td className="px-3.5 py-3 text-ink-body">{o.delivery}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sorted.length > TOP_ROWS && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="min-h-[44px] self-center rounded-full border-2 border-sky-line bg-surface px-6 font-semibold text-brand hover:border-brand"
          >
            {showAll ? "ย่อเหลือ 10 อันดับ" : `ดูทั้งหมด ${sorted.length} ร้าน`}
          </button>
        )}
        <p className="text-sm text-ink-muted">{t.intlNote}</p>
      </Card>

      <div className="flex flex-wrap items-start gap-[22px]">
        <Card className="flex min-w-0 flex-[999_1_480px] flex-col gap-3">
          <h2 className="text-lg font-semibold">{t.historyTitle}</h2>
          <PriceHistoryChart history={p.price_history} platforms={catalog.data.platforms} />
        </Card>
        <Card className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
          <h2 className="text-lg font-semibold">{t.searchTitle}</h2>
          <SearchTrendChart values={p.search_index} />
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">{t.peak}</span>
            <b>{p.search_growth_pct >= 30 ? t.peakDays.replace("{days}", String(p.peak_in_days)) : t.noPeak}</b>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-start gap-[22px]">
        <section className="flex min-w-0 flex-[1_1_320px] flex-col gap-3 rounded-2xl bg-navy p-5 text-white">
          <h2 className="text-lg font-semibold">{t.aiTitle}</h2>
          <p className="text-sm leading-relaxed">{insight}</p>
          <Link
            href="/market/chat"
            className="inline-flex min-h-[40px] items-center self-start rounded-[10px] bg-surface px-4 text-sm font-semibold text-ink"
          >
            {t.askAI}
          </Link>
        </section>

        <Card className="flex min-w-0 flex-[999_1_480px] flex-col gap-3">
          <h2 className="text-lg font-semibold">{t.calcTitle}</h2>
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">{t.calcCost}</span>
            <b>
              {baht(best.total)} · {best.name}
            </b>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink-muted">{th.marketRadar.compare.sellPrice}</span>
              <input
                type="number"
                min={0}
                value={sellPrice}
                onChange={(e) => setSell(e.target.valueAsNumber)}
                className="min-h-[44px] rounded-[10px] border border-line px-3 text-base font-semibold"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink-muted">{th.marketRadar.compare.fee}</span>
              <input
                type="number"
                min={0}
                value={fee}
                onChange={(e) => setFee(e.target.valueAsNumber)}
                className="min-h-[44px] rounded-[10px] border border-line px-3 text-base font-semibold"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-line-subtle px-4 py-3">
              <div className="text-xs text-ink-muted">{th.marketRadar.compare.feeBaht}</div>
              <div className="text-xl font-bold">{baht(feeBaht)}</div>
            </div>
            <div className={`rounded-xl px-4 py-3 text-white ${profit >= 0 ? "bg-navy" : "bg-expense-solid"}`}>
              <div className="text-xs text-[#CBD5E1]">{th.marketRadar.compare.profit}</div>
              <div className="text-xl font-bold">{baht(profit)}</div>
              <div className="text-xs text-[#6EE7B7]">
                {th.marketRadar.compare.margin.replace("{pct}", sellPrice > 0 ? ((profit / sellPrice) * 100).toFixed(0) : "0")}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{t.howTitle}</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.how.map(([title, body], i) => (
            <li key={title} className="flex gap-3">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-brand text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <div className="font-semibold">{title}</div>
                <p className="text-sm text-ink-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

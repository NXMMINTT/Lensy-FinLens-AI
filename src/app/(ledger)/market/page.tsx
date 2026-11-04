"use client";

import Link from "next/link";
import { useState } from "react";

import { UFoxLive } from "@/components/brand/UFoxLive";
import { useCompetitorPrices } from "@/hooks/market/useCompetitorPrices";
import { useEuArbitrage } from "@/hooks/market/useEuArbitrage";
import { useKeywordVolume } from "@/hooks/market/useKeywordVolume";
import { useMarketProducts } from "@/hooks/market/useMarketProducts";
import { useMarketTrend } from "@/hooks/market/useMarketTrend";
import { useRecordSponsorClick } from "@/hooks/market/useRecordSponsorClick";
import { useSponsors } from "@/hooks/market/useSponsors";
import { useUFoxInsights } from "@/hooks/market/useUFoxInsights";
import type { CompetitorPrices } from "@/types/market";
import { formatBaht } from "@/lib/format";
import { platformLogo } from "@/lib/market/platformLogo";

const IN_STOCK = "มีสินค้า";
const EUR_TO_THB = 39; // approximate demo rate, not live — the UI says "ประมาณ"

/** Market Radar overview (premium lock and trial badge live in layout.tsx). */
export default function MarketRadarPage() {
  // undefined until the shop picks one; the backend then answers with its first product.
  const [picked, setPicked] = useState<string>();
  const products = useMarketProducts();
  const prices = useCompetitorPrices({ productId: picked });
  const productId = prices.data?.product_id;
  const ubot = useUFoxInsights(productId);
  const trend = useMarketTrend(productId);
  const keywords = useKeywordVolume(productId);
  const eu = useEuArbitrage();
  const sponsors = useSponsors(productId);
  const sponsorClick = useRecordSponsorClick();

  if (prices.error) return <p className="rounded-3xl bg-danger-soft p-6 text-expense">โหลดข้อมูลตลาดไม่สำเร็จ: {prices.error.message}</p>;
  if (!prices.data) return <p className="rounded-3xl bg-surface p-6 text-center text-ink-muted">กำลังโหลดข้อมูลตลาด…</p>;

  const p = prices.data;
  const suggested = ubot.data?.suggested_price;
  const euItem = eu.data?.find((e) => e.product_id === p.product_id);
  const shares = platformShares(trend.data?.series ?? []);
  const topKeywords = [...(keywords.data ?? [])].sort((a, b) => b.search_volume - a.search_volume).slice(0, 4);
  const sponsor = sponsors.data?.[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div>
          <p className="m-0 text-[15px] text-ink-muted">วิเคราะห์ตลาดของ</p>
          <h2 className="m-0 text-2xl font-bold leading-snug md:text-[28px]">{p.product_name}</h2>
        </div>
        {products.data && products.data.length > 1 && (
          <div role="group" aria-label="เลือกสินค้าที่จะดูภาพรวม" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
            {products.data.map((item) => {
              const active = item.product_id === p.product_id;
              return (
                <button
                  key={item.product_id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPicked(item.product_id)}
                  className={`inline-flex min-h-[40px] flex-none items-center whitespace-nowrap rounded-full px-4 text-[15px] ${
                    active ? "bg-brand font-semibold text-white" : "border border-line bg-surface text-ink-body hover:border-brand hover:text-brand"
                  }`}
                >
                  {item.product_name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <section
        aria-label="U-Fox แนะนำราคา"
        aria-busy={prices.isPlaceholderData}
        className={`flex flex-wrap items-center gap-x-8 gap-y-5 rounded-[28px] bg-sky-deep p-6 md:p-8 ${prices.isPlaceholderData ? "opacity-60" : ""}`}
      >
        <UFoxLive
          pose="radar"
          size={96}
          bubbleSide="right"
          tips={["หนูแอบส่องคู่แข่งมาให้แล้วค่ะ", "แท่งสีน้ำเงินเข้มในกราฟคือร้านคุณนะ", "ร้านที่ของหมด คือโอกาสของเรา!"]}
          className="shrink-0 max-sm:hidden"
        />
        <div className="min-w-0 flex-[1_1_400px]">
          <div className="text-[15px] font-semibold text-brand">U-Fox แนะนำวันนี้</div>
          {ubot.data ? (
            <>
              <p className="m-0 text-lg leading-relaxed md:text-xl">{ubot.data.reason}</p>
              {ubot.data.insights.length > 0 && (
                <ul className="mb-0 mt-3 flex flex-col gap-1 pl-5 text-[15px] text-ink-body">
                  {ubot.data.insights.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="m-0 text-lg text-ink-muted">{ubot.error ? `U-Fox ยังตอบไม่ได้: ${ubot.error.message}` : "U-Fox กำลังวิเคราะห์ราคาคู่แข่ง…"}</p>
          )}
        </div>
        {suggested !== undefined && (
          <div className="flex flex-col items-center gap-1 rounded-[22px] bg-surface px-6 py-4">
            <div className="text-sm text-ink-muted">ราคาแนะนำ</div>
            <div className="text-[30px] font-bold leading-tight text-brand">{formatBaht(suggested)}</div>
            <div className="text-sm text-ink-muted">กำไร {formatBaht(suggested - p.my_cost_price)} ต่อชิ้น</div>
          </div>
        )}
      </section>

      <PriceStrip prices={p} suggested={suggested} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-5">
        <InfoCard label="ขายที่ไหนดี" title="ขายที่ไหนดี" subtitle="สัดส่วนยอดขายสินค้าแบบเดียวกัน แยกตามแพลตฟอร์ม">
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {shares.slice(0, 4).map((s, i) => (
              <li key={s.platform} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[15px]">
                  <span>{s.platform}</span>
                  <b className="tabular-nums">{s.pct}%</b>
                </div>
                <div className="h-2 rounded-full bg-brand-soft">
                  <div className={`h-full rounded-full ${i === 0 ? "bg-brand" : "bg-brand-light"}`} style={{ width: `${(s.pct / shares[0].pct) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard label="คำค้นยอดฮิต" title="ลูกค้าค้นหาคำว่า" subtitle="ใส่คำที่กำลังมาแรงในชื่อสินค้าหรือโฆษณาได้เลย">
          <ol className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0">
            {topKeywords.map((k) => (
              <li key={`${k.product_id}-${k.keyword}-${k.platform}`} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold">{k.keyword}</div>
                  <div className="text-sm text-ink-muted">{k.platform}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {k.trend === "up" && <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success-ink">มาแรง</span>}
                  <span className="w-14 text-right text-[15px] tabular-nums text-ink-body">{(k.search_volume / 1000).toFixed(1)}k</span>
                </div>
              </li>
            ))}
          </ol>
        </InfoCard>

        {euItem && (
          <InfoCard label="ส่งออกยุโรป" title="ส่งไปยุโรปได้ไหม" subtitle={euItem.eu_market.region}>
            <dl className="m-0 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-brand-tint px-4 py-3">
                <dt className="text-sm text-ink-muted">ราคาปลีก</dt>
                <dd className="m-0 text-xl font-bold text-ink">€{euItem.eu_market.avg_retail_price_eur.toFixed(2)}</dd>
                <dd className="m-0 text-sm text-ink-muted">≈ {formatBaht(euItem.eu_market.avg_retail_price_eur * EUR_TO_THB)}</dd>
              </div>
              <div className="rounded-2xl bg-brand-tint px-4 py-3">
                <dt className="text-sm text-ink-muted">ราคาส่งแนะนำ</dt>
                <dd className="m-0 text-xl font-bold text-ink">€{euItem.eu_market.suggested_wholesale_price_eur.toFixed(2)}</dd>
                <dd className="m-0 text-sm text-ink-muted">≈ {formatBaht(euItem.eu_market.suggested_wholesale_price_eur * EUR_TO_THB)}</dd>
              </div>
            </dl>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[15px]">
                <span>ความต้องการตลาด</span>
                <b className="tabular-nums">{euItem.eu_market.demand_score}/100</b>
              </div>
              <div className="h-2 rounded-full bg-success-soft">
                <div className="h-full rounded-full bg-[#22B862]" style={{ width: `${euItem.eu_market.demand_score}%` }} />
              </div>
            </div>
            <p className="m-0 text-sm text-ink-muted">{euItem.eu_market.demand_note}</p>
          </InfoCard>
        )}
      </div>

      {sponsor && (
        <section aria-label="ผู้สนับสนุน" className="flex flex-col gap-4 rounded-[28px] border-2 border-[#FFE7A3] dark:border-sun/30 bg-surface p-6 md:flex-row md:items-center md:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sun-soft px-3 py-0.5 text-[13px] font-bold text-sun-ink">ผู้สนับสนุน</span>
              <span className="text-sm text-ink-muted">
                {sponsor.sponsor_name} · {sponsor.sponsor_type}
              </span>
            </div>
            <div className="text-lg font-semibold leading-snug">{sponsor.product_name}</div>
            <p className="m-0 line-clamp-2 text-[15px] text-ink-muted">{sponsor.description}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 md:items-end">
            <div className="text-xl font-bold text-ink">
              {formatBaht(sponsor.price)}
              <span className="text-[15px] font-normal text-ink-muted">/{sponsor.unit}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/market/sponsors"
                className="inline-flex min-h-[44px] items-center rounded-full border border-line bg-surface px-4 font-semibold text-ink-body no-underline hover:border-brand hover:text-brand"
              >
                ดูข้อเสนอทั้งหมด
              </Link>
              <Link
                href={`/market/sponsors/${sponsor.listing_id}`}
                onClick={() => sponsorClick.mutate(sponsor.listing_id)}
                className="inline-flex min-h-[44px] items-center rounded-full bg-brand px-5 font-semibold text-white no-underline"
              >
                ดูข้อเสนอ
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function InfoCard({ label, title, subtitle, children }: { label: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section aria-label={label} className="flex flex-col gap-4 rounded-[28px] bg-surface p-6">
      <div>
        <h2 className="m-0 text-xl font-semibold">{title}</h2>
        <p className="m-0 text-[15px] text-ink-muted">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function platformShares(series: { platform: string; points: { units_sold: number }[] }[]) {
  const totals = series.map((s) => ({ platform: s.platform, units: s.points.reduce((sum, pt) => sum + pt.units_sold, 0) }));
  const all = totals.reduce((sum, t) => sum + t.units, 0) || 1;
  return totals.map((t) => ({ platform: t.platform, pct: Math.round((t.units / all) * 100) })).sort((a, b) => b.pct - a.pct);
}

function quantile(sorted: number[], q: number) {
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i);
  return sorted[lo] + (sorted[Math.ceil(i)] - sorted[lo]) * (i - lo);
}

/** Competitor price section (spec 2.2): summary cards, a per-platform bar chart and two comparison tables. */
function PriceStrip({ prices: p, suggested }: { prices: CompetitorPrices; suggested: number | undefined }) {
  const thai = p.competitors.filter((c) => c.currency === "THB" && c.price !== null) as (CompetitorPrices["competitors"][number] & { price: number })[];
  const sorted = [...thai].sort((a, b) => a.price - b.price);
  const inStock = thai.filter((c) => c.stock === IN_STOCK).map((c) => c.price).sort((a, b) => a - b);
  const median = inStock.length ? quantile(inStock, 0.5) : p.price_distribution_thb.median;
  const diffFromMine = sorted.map((c) => ({ ...c, diff: Math.round(c.price - p.my_selling_price) }));
  const cheaper = diffFromMine.filter((c) => c.diff < 0);
  const pricier = diffFromMine.filter((c) => c.diff >= 0).sort((a, b) => b.price - a.price);

  return (
    <section aria-label="ราคาคู่แข่ง" className="flex flex-col gap-5 rounded-[28px] bg-surface p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-[22px] font-semibold">คู่แข่งขายเท่าไหร่</h2>
        <span className="text-[15px] text-ink-muted">
          {thai.length} ร้านในไทย · ราคากลาง {formatBaht(median)}
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-4">
        <SummaryCard icon={<TargetIcon />} label="ราคาที่แนะนำ" value={suggested !== undefined ? formatBaht(suggested) : "—"} />
        <SummaryCard icon={<CoinIcon />} label="ต้นทุนสินค้า" value={formatBaht(p.my_cost_price)} />
        <SummaryCard icon={<ChartIcon />} label="ราคากลางตลาด" value={formatBaht(median)} />
        <SummaryCard
          icon={<TrendIcon />}
          label="ราคาของร้านคุณ"
          value={formatBaht(p.my_selling_price)}
          sub={`ส่วนต่างจากราคากลาง ${p.my_selling_price - median >= 0 ? "+" : ""}${formatBaht(p.my_selling_price - median)}`}
          accent
        />
      </div>

      <PriceBarChart
        competitors={sorted}
        myPrice={p.my_selling_price}
        suggested={suggested}
        costPrice={p.my_cost_price}
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-5 rounded-[22px] bg-brand-tint/60 p-5">
        <CompareTable title="ราคาถูก/แพลตฟอร์ม" rows={cheaper} mySellingPrice={p.my_selling_price} />
        <CompareTable title="ราคาสูง/แพลตฟอร์ม" rows={pricier} mySellingPrice={p.my_selling_price} />
      </div>
    </section>
  );
}

function SummaryCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] bg-brand-soft/60 px-4 py-4">
      <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface text-brand">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[15px] text-ink-muted">{label}</div>
        <div className={`text-[24px] font-bold leading-tight ${accent ? "text-brand" : "text-ink"}`}>{value}</div>
        {sub && <div className={`text-sm font-semibold ${sub.startsWith("-") ? "text-expense" : "text-success-ink"}`}>{sub}</div>}
      </div>
    </div>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function TargetIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

function CoinIcon() {
  return (
    <Icon>
      <circle cx="9" cy="9" r="6" />
      <path d="M14.2 5.2a6 6 0 1 1-8.99 8.9" />
      <path d="M9 6v6M7 7.5h4M7 10.5h4" strokeWidth="1.4" />
    </Icon>
  );
}

function ChartIcon() {
  return (
    <Icon>
      <path d="M4 20h16" />
      <rect x="5" y="11" width="3.5" height="6" rx="1" />
      <rect x="10.25" y="7" width="3.5" height="10" rx="1" />
      <rect x="15.5" y="4" width="3.5" height="13" rx="1" />
    </Icon>
  );
}

function TrendIcon() {
  return (
    <Icon>
      <path d="M3 17l6-6 4 4 7-8" />
      <path d="M15 7h5v5" />
    </Icon>
  );
}

const CHEAPEST = 0;

function barColor(i: number, total: number, stock: string, isMine: boolean) {
  if (isMine) return "bg-navy";
  if (stock !== IN_STOCK) return "bg-[#D3D9E3]";
  if (i === CHEAPEST) return "bg-[#22B862]";
  if (i === total - 1) return "bg-[#F05461]";
  return "bg-[#79AEF3]";
}

const PLOT_H = 320;
const TICK_STEPS = [10, 20, 25, 50, 100, 200, 250, 500, 1000];

/** Bar chart of every competitor's price, with the cost line and the suggested-price band overlaid.
 *  Axis, gridlines, overlays and bars all sit in one plot box so they share the same ฿0 baseline and scale. */
function PriceBarChart({
  competitors,
  myPrice,
  suggested,
  costPrice,
}: {
  competitors: (CompetitorPrices["competitors"][number] & { price: number })[];
  myPrice: number;
  suggested: number | undefined;
  costPrice: number;
}) {
  const total = competitors.length + 1;
  // Headroom above the tallest bar for its price label, and about five gridlines whatever the price range.
  const max = Math.max(myPrice, costPrice, suggested ?? 0, ...competitors.map((c) => c.price)) * 1.15;
  const step = TICK_STEPS.find((s) => max / s <= 5) ?? 2000;
  const top = Math.ceil(max / step) * step;
  const h = (v: number) => (v / top) * PLOT_H;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const bandHalf = Math.max(3, h(4));
  const bars = [
    ...competitors.map((c, i) => ({ key: `${c.platform_id}-${c.seller}`, id: c.platform_id, name: c.platform, seller: c.seller, price: c.price, stock: c.stock, index: i, mine: false })),
    { key: "mine", id: "", name: "ร้านคุณ", seller: undefined, price: myPrice, stock: IN_STOCK, index: total - 1, mine: true },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-navy" />
          ร้านคุณ
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="w-5 border-t-2 border-dashed border-[#F5A54B]" />
          ต้นทุน {formatBaht(costPrice)}
        </span>
        {suggested !== undefined && (
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="h-3 w-5 rounded-sm bg-brand-light/25" />
            ราคาแนะนำ {formatBaht(suggested)}
          </span>
        )}
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-[#D3D9E3]" />
          ของหมด
        </span>
      </div>

      <div className="flex gap-3">
        {/* Y axis */}
        <div className="relative w-12 shrink-0" style={{ height: PLOT_H }}>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 translate-y-1/2 text-[13px] text-ink-muted" style={{ bottom: h(t) }}>
              ฿{t}
            </span>
          ))}
        </div>
        <div className="relative flex-1 border-b border-l border-line" style={{ height: PLOT_H }}>
          {ticks.slice(1).map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-line-subtle" style={{ bottom: h(t) }} />
          ))}
          {suggested !== undefined && (
            <div className="absolute inset-x-0 bg-brand-light/25" style={{ bottom: h(suggested) - bandHalf, height: bandHalf * 2 }} />
          )}
          <div className="absolute inset-0 flex items-end gap-1.5 px-1">
            {bars.map((b) => (
              <div
                key={b.key}
                className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                title={`${b.name}${b.seller ? ` ${b.seller}` : ""} ${formatBaht(b.price)}${b.stock === IN_STOCK ? "" : " (ของหมด)"}`}
              >
                <span className={`text-[15px] font-bold ${b.mine ? "text-ink" : b.stock === IN_STOCK ? "text-ink-body" : "text-ink-muted"}`}>{formatBaht(b.price)}</span>
                <div
                  className={`w-full max-w-[58px] rounded-t-xl transition-[height] ${barColor(b.index, total, b.stock, b.mine)} ${b.mine ? "ring-2 ring-brand ring-offset-2 ring-offset-surface" : ""}`}
                  style={{ height: Math.max(h(b.price), 6) }}
                />
              </div>
            ))}
          </div>
          {/* cost line drawn over the bars so it stays visible across them */}
          <div className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-[#F5A54B]" style={{ bottom: h(costPrice) }} />
        </div>
      </div>

      <div className="flex gap-3">
        <div aria-hidden="true" className="w-12 shrink-0" />
        <div className="flex flex-1 gap-1.5 px-1">
          {bars.map((b) => (
            <div key={b.key} className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
              <PlatformLogo id={b.id} name={b.name} seller={b.seller} mine={b.mine} />
              {b.stock !== IN_STOCK && <span className="text-[12px] text-ink-muted">ของหมด</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareTable({
  title,
  rows,
  mySellingPrice,
}: {
  title: string;
  rows: (CompetitorPrices["competitors"][number] & { price: number; diff: number })[];
  mySellingPrice: number;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="rounded-[18px] bg-surface p-4">
      <div className="mb-2 grid grid-cols-[minmax(0,1fr)_72px_168px] gap-x-4 text-[15px] font-semibold text-ink-muted">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-8 w-8 shrink-0" />
          {title}
        </span>
        <span className="text-right">ราคา</span>
        <span className="text-center">ส่วนต่างจากร้านคุณ</span>
      </div>
      <ul className="m-0 flex list-none flex-col divide-y divide-line p-0">
        {rows.map((c) => (
          <li key={`${c.platform}-${c.seller}`} className="grid grid-cols-[minmax(0,1fr)_72px_168px] items-center gap-x-4 py-2.5">
            <span className="flex min-w-0 items-center gap-3 truncate font-medium">
              <PlatformLogo id={c.platform_id} name={c.platform} compact />
              {c.seller}
              {c.stock !== IN_STOCK && <span className="text-[13px] text-ink-muted">ของหมด</span>}
            </span>
            <b className="text-right tabular-nums">{formatBaht(c.price)}</b>
            <b className={`text-center tabular-nums ${c.diff < 0 ? "text-expense" : "text-success-ink"}`}>{c.diff > 0 ? `+${c.diff}` : c.diff}</b>
          </li>
        ))}
        <li className="grid grid-cols-[minmax(0,1fr)_72px_168px] items-center gap-x-4 bg-brand-soft/50 py-2.5 pl-2">
          <span className="flex items-center gap-3 font-bold text-ink">
            <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-navy text-[13px] font-bold text-white">คุณ</span>
            ร้านคุณ
          </span>
          <b className="text-right tabular-nums">{formatBaht(mySellingPrice)}</b>
          <b className="text-center tabular-nums">0</b>
        </li>
      </ul>
    </div>
  );
}

/** Platform badge (fixed 32px square, white tile style so every logo renders the same size)
 *  with the platform/seller caption; falls back to a letter badge when there's no asset. */
function PlatformLogo({
  id,
  name,
  seller,
  mine,
  compact,
}: {
  id: string;
  name: string;
  seller?: string;
  mine?: boolean;
  /** Table rows: hide the text caption, show only the square badge. */
  compact?: boolean;
}) {
  const badge = (() => {
    if (mine)
      return (
        <span aria-hidden="true" className="grid h-8 w-8 flex-none place-items-center rounded-[10px] bg-navy text-[13px] font-bold text-white">คุณ</span>
      );
    const src = platformLogo(id) ?? platformLogo(name);
    return src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" aria-hidden="true" className="h-8 w-8 flex-none rounded-[10px] border border-line bg-white object-contain p-1" />
    ) : (
      <span aria-hidden="true" className="grid h-8 w-8 flex-none place-items-center rounded-[10px] bg-brand-soft text-sm font-bold text-brand">
        {name.charAt(0).toUpperCase()}
      </span>
    );
  })();

  if (compact) return badge;
  return (
    <span className="flex max-w-[86px] flex-col items-center gap-0.5">
      {badge}
      {!mine && <span className="w-[86px] truncate text-center text-[12px] leading-4 text-ink-body">{name}</span>}
      {!mine && seller && <span className="w-[86px] truncate text-center text-[12px] leading-4 text-ink-muted">{seller}</span>}
    </span>
  );
}

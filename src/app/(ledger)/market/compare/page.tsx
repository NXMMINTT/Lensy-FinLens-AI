"use client";

import { useState } from "react";

import { PlatformBadge } from "@/components/market/PlatformBadge";
import { PricePositionBar } from "@/components/market/PricePositionBar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LineIcon } from "@/components/ui/LineIcon";
import { useProducts } from "@/hooks/dashboard/useProducts";
import { useCompetitorPrices } from "@/hooks/market/useCompetitorPrices";
import { useUFoxInsights } from "@/hooks/market/useUFoxInsights";
import { isAvailable } from "@/lib/market/competitorAvailability";
import { toTHB } from "@/lib/market/currency";
import { productPhoto } from "@/lib/market/productPhoto";
import { useLocale } from "@/lib/i18n";

type Sort = "cheapest" | "priciest" | "platform";

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-[36px] items-center rounded-[10px] px-3 text-sm ${
        active ? "bg-navy font-semibold text-white" : "border border-line bg-surface text-ink-body"
      }`}
    >
      {children}
    </button>
  );
}

/** Kept as text so a field can be cleared while typing (an empty field counts as 0, never NaN). */
function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-ink-muted">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] rounded-[10px] border border-line px-3 text-base font-semibold text-ink"
      />
    </label>
  );
}

const MOCK_PRODUCTS = [
  { id: "P001", name: "น้ำพริกเผา" },
  { id: "P002", name: "ชาไทยผง" },
  { id: "P003", name: "ผ้าขาวม้าทอมือ" },
  { id: "P004", name: "กล้วยตาก" },
  { id: "P005", name: "สบู่สมุนไพร" },
];

export default function ComparePage() {
  const th = useLocale();
  const t = th.marketRadar.compare;
  const products = useProducts();
  const [selectedProductId, setSelectedProductId] = useState("P001");
  const [stockProductId, setStockProductId] = useState("");
  const stockProduct = products.data?.find((sp) => String(sp.id) === stockProductId);
  const { data, error, isLoading } = useCompetitorPrices(
    stockProduct ? { name: stockProduct.name } : { productId: selectedProductId },
  );
  const ubot = useUFoxInsights(data?.product_id);
  const [sort, setSort] = useState<Sort>("cheapest");
  const [thaiOnly, setThaiOnly] = useState(true);
  const [cost, setCost] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState<string | null>(null);
  const [feePct, setFeePct] = useState("10");

  if (error) return <Card className="border-danger-line bg-danger-soft text-sm text-danger-ink">{error.message}</Card>;
  if (isLoading || !data) return <Card className="text-center text-sm text-ink-muted">{th.myBusiness.loading}</Card>;

  const rows = data.competitors
    .filter((c) => !thaiOnly || c.currency === "THB")
    .map((c) => ({ ...c, thb: toTHB(c.price, c.currency) }))
    .sort((a, b) => {
      if (sort === "platform") return a.platform.localeCompare(b.platform);
      // Listings without a price always sink to the bottom.
      const pa = a.thb ?? Number.POSITIVE_INFINITY;
      const pb = b.thb ?? Number.POSITIVE_INFINITY;
      return sort === "cheapest" ? pa - pb : (b.thb ?? -1) - (a.thb ?? -1);
    });

  const available = rows.filter((r) => isAvailable(r) && r.thb !== null);
  const cheapest = available.reduce<(typeof available)[number] | null>((m, r) => (!m || r.thb! < m.thb! ? r : m), null);
  const priciest = available.reduce<(typeof available)[number] | null>((m, r) => (!m || r.thb! > m.thb! ? r : m), null);

  const costText = cost ?? String(data.my_cost_price);
  const priceText = sellPrice ?? String(data.my_selling_price);
  const unitCost = Number(costText) || 0;
  const price = Number(priceText) || 0;
  const feeBaht = (price * (Number(feePct) || 0)) / 100;
  const profit = price - unitCost - feeBaht;
  const margin = price > 0 ? (profit / price) * 100 : 0;
  const thaiAvailable = data.competitors.filter((c) => c.currency === "THB" && isAvailable(c));
  const suggested = ubot.data?.suggested_price;

  return (
    <div className="flex flex-col gap-[22px]">
      <h2 className="flex items-center gap-3 text-xl font-semibold md:text-2xl">
        <span className="grid h-10 w-10 flex-none place-items-center overflow-hidden rounded-[10px] bg-brand-soft text-xl" aria-hidden="true">
          {productPhoto(data.product_name) ? (
            // eslint-disable-next-line @next/next/no-img-element -- static product photo
            <img src={productPhoto(data.product_name)!} alt="" className="h-full w-full object-cover" />
          ) : (
            <LineIcon name="box" size={20} className="text-brand" />
          )}
        </span>
        {t.title} · {data.product_name}
      </h2>

      <Card className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-ink-body">{t.title}</span>
          <div className="-mx-1 flex flex-wrap gap-2 px-1">
            {MOCK_PRODUCTS.map((mp) => (
              <button
                key={mp.id}
                type="button"
                onClick={() => { setSelectedProductId(mp.id); setStockProductId(""); setCost(null); setSellPrice(null); }}
                className={`min-h-[40px] rounded-full px-4 text-sm font-semibold transition-colors ${
                  selectedProductId === mp.id && !stockProductId
                    ? "bg-brand text-white"
                    : "border border-line bg-surface text-ink-body hover:border-brand hover:text-brand"
                }`}
              >
                {mp.name}
              </button>
            ))}
          </div>
        </label>
        {(products.data ?? []).length > 0 && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-ink-muted">หรือเลือกจากสินค้าในสต็อกของร้าน</span>
            <select
              value={stockProductId}
              onChange={(e) => {
                setStockProductId(e.target.value);
                const picked = products.data?.find((sp) => String(sp.id) === e.target.value);
                setCost(picked?.unit_cost ? String(Number(picked.unit_cost)) : null);
                setSellPrice(null);
              }}
              className="min-h-[44px] rounded-[10px] border border-line bg-surface px-3 text-base text-ink"
            >
              <option value="">— เลือกสินค้าของร้าน —</option>
              {(products.data ?? []).map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                  {sp.unit_cost ? ` · ต้นทุน ฿${Number(sp.unit_cost)}` : ""}
                </option>
              ))}
            </select>
          </label>
        )}
        {stockProduct && !stockProduct.unit_cost && (
          <span className="text-xs text-sun-ink">สินค้านี้ยังไม่มีต้นทุน ใส่เองในช่องต้นทุนด้านล่าง หรือตั้งได้ที่หน้าสต็อก (แก้ไข → ต้นทุน/หน่วย)</span>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-success-soft px-4 py-3.5 text-success-ink">
          <div className="text-xs">{t.cheapest}</div>
          <div className="text-[22px] font-bold">{cheapest ? `฿${cheapest.thb}` : "-"}</div>
          <div className="text-xs">{cheapest ? `${cheapest.platform} · ${cheapest.seller}` : ""}</div>
        </div>
        <div className="rounded-xl bg-line-subtle px-4 py-3.5 text-ink-body">
          <div className="text-xs">{t.priciest}</div>
          <div className="text-[22px] font-bold text-ink">{priciest ? `฿${priciest.thb}` : "-"}</div>
          <div className="text-xs">{priciest ? `${priciest.platform} · ${priciest.seller}` : ""}</div>
        </div>
        <div className="rounded-xl bg-brand-soft px-4 py-3.5 text-brand-dark dark:text-brand-light">
          <div className="text-xs">{t.spread}</div>
          <div className="text-[22px] font-bold">{cheapest && priciest ? `฿${priciest.thb! - cheapest.thb!}` : "-"}</div>
          <div className="text-xs">
            {th.marketRadar.overview.myPrice} ฿{price.toLocaleString("en-US")}
          </div>
        </div>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="m-0 text-lg font-semibold">ราคาของคุณอยู่ตรงไหน</h2>
            <p className="m-0 text-xs text-ink-muted">เทียบกับร้านในไทยที่มีของ · ราคาคุณขยับตามช่อง “ราคาที่จะขาย” ด้านล่าง</p>
          </div>
          {suggested !== undefined && Number(suggested) !== price && (
            <button
              type="button"
              onClick={() => setSellPrice(String(suggested))}
              className="min-h-[40px] rounded-full bg-sun px-4 text-sm font-bold text-[#4A3500]"
            >
              ใช้ราคาแนะนำ ฿{suggested}
            </button>
          )}
        </div>
        <PricePositionBar competitorPrices={thaiAvailable.map((c) => c.price!)} myPrice={price} suggestedPrice={suggested} />
        {ubot.data && (
          <p className="m-0 rounded-xl bg-brand-tint px-4 py-3 text-sm text-ink-body">
            <b className="text-brand">U-Fox แนะนำ ฿{ubot.data.suggested_price}:</b> {ubot.data.reason}
          </p>
        )}
        {ubot.isLoading && <p className="m-0 text-sm text-ink-muted">U-Fox กำลังคิดราคาแนะนำ…</p>}
      </Card>

      <Card className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" className="flex flex-wrap gap-2">
            <Toggle active={sort === "cheapest"} onClick={() => setSort("cheapest")}>
              {t.sortCheapest}
            </Toggle>
            <Toggle active={sort === "priciest"} onClick={() => setSort("priciest")}>
              {t.sortPriciest}
            </Toggle>
            <Toggle active={sort === "platform"} onClick={() => setSort("platform")}>
              {t.sortPlatform}
            </Toggle>
          </div>
          <div role="group" className="flex flex-wrap gap-2">
            <Toggle active={thaiOnly} onClick={() => setThaiOnly(true)}>
              {t.thaiOnly}
            </Toggle>
            <Toggle active={!thaiOnly} onClick={() => setThaiOnly(false)}>
              {t.all}
            </Toggle>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="bg-line-subtle text-left text-xs text-ink-muted">
                <th className="px-3.5 py-3 font-semibold">{t.colPlatform}</th>
                {!thaiOnly && <th className="px-3.5 py-3 text-right font-semibold">{t.colOriginal}</th>}
                <th className="px-3.5 py-3 text-right font-semibold">{t.colTHB}</th>
                <th className="px-3.5 py-3 text-right font-semibold">{t.colVsMine}</th>
                <th className="px-3.5 py-3 font-semibold">{t.colStock}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const diff = r.thb === null ? null : r.thb - price;
                const soldOut = r.stock === "สินค้าหมด";
                const isCheapest = cheapest?.seller === r.seller && cheapest.platform_id === r.platform_id;
                return (
                  <tr
                    key={`${r.platform_id}-${r.seller}`}
                    className={`border-t border-line-subtle ${isCheapest ? "bg-success-soft" : soldOut ? "bg-sun-soft/50" : ""}`}
                  >
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <PlatformBadge id={r.platform_id} name={r.platform} />
                        <div className="min-w-0">
                          <div className="font-semibold">{r.platform}</div>
                          <div className="truncate text-xs text-ink-muted">{r.seller}</div>
                        </div>
                      </div>
                    </td>
                    {!thaiOnly && (
                      <td className="px-3.5 py-3 text-right text-ink-muted">
                        {r.price === null
                          ? "-"
                          : r.currency === "THB"
                            ? `฿${r.price}`
                            : `${r.price.toLocaleString("en-US")} ${r.currency}`}
                      </td>
                    )}
                    <td className="px-3.5 py-3 text-right font-semibold">
                      {r.thb === null ? "-" : `${r.currency === "THB" ? "" : "≈"}฿${r.thb.toLocaleString("en-US")}`}
                    </td>
                    <td className={`px-3.5 py-3 text-right ${diff === null ? "" : diff < 0 ? "text-expense" : "text-income"}`}>
                      {diff === null
                        ? "-"
                        : diff === 0
                          ? "เท่ากัน"
                          : `${diff < 0 ? "ถูกกว่า" : "แพงกว่า"} ฿${Math.abs(diff).toLocaleString("en-US")}`}
                    </td>
                    <td className="px-3.5 py-3">
                      <Badge tone={r.stock === "มีสินค้า" ? "success" : r.stock === "สินค้าหมด" ? "warning" : "neutral"}>
                        {r.stock}
                      </Badge>
                      {soldOut && <div className="mt-1 text-xs font-semibold text-sun-ink">โอกาสขาย: ลูกค้าร้านนี้หาของไม่ได้</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{t.calcTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label={t.cost} value={costText} onChange={setCost} />
          <NumberField label={t.sellPrice} value={priceText} onChange={setSellPrice} />
          <NumberField label={t.fee} value={feePct} onChange={setFeePct} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-line-subtle px-4 py-3">
            <div className="text-xs text-ink-muted">{t.feeBaht}</div>
            <div className="text-xl font-bold">฿{feeBaht.toFixed(2)}</div>
          </div>
          <div className={`rounded-xl px-4 py-3 text-white ${profit < 0 ? "bg-expense-solid" : "bg-navy"}`}>
            <div className="text-xs text-[#E2E8F0]">{profit < 0 ? "ขาดทุนต่อชิ้น" : t.profit}</div>
            <div className="text-xl font-bold">฿{Math.abs(profit).toFixed(2)}</div>
            <div className={`text-xs ${profit < 0 ? "text-[#FECACA]" : "text-[#6EE7B7]"}`}>{t.margin.replace("{pct}", margin.toFixed(0))}</div>
          </div>
        </div>
        <p className="text-xs text-ink-muted">
          {t.vsMarket
            .replace("{count}", String(thaiAvailable.filter((c) => (c.price ?? 0) > price).length))
            .replace("{total}", String(thaiAvailable.length))}
        </p>
      </Card>
    </div>
  );
}

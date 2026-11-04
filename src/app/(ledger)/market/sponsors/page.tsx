"use client";

import Link from "next/link";
import { useState } from "react";

import { useAllSponsors } from "@/hooks/market/useAllSponsors";
import { useMarketProducts } from "@/hooks/market/useMarketProducts";
import { useRecordSponsorClick } from "@/hooks/market/useRecordSponsorClick";
import { formatBaht } from "@/lib/format";

/** Sponsored B2B offers (raw materials, packaging) matched to the shop's products. */
export default function SponsorsPage() {
  const [productId, setProductId] = useState<string>();
  const products = useMarketProducts();
  const sponsors = useAllSponsors(productId);
  const sponsorClick = useRecordSponsorClick();
  const productName = (id: string) => products.data?.find((p) => p.product_id === id)?.product_name;

  const filters = [{ id: undefined, label: "ทั้งหมด" }, ...(products.data ?? []).map((p) => ({ id: p.product_id, label: p.product_name }))];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="m-0 text-2xl font-bold leading-snug md:text-[28px]">ข้อเสนอจากผู้สนับสนุน</h2>
          <p className="m-0 text-[15px] text-ink-muted">วัตถุดิบและบรรจุภัณฑ์ราคาส่งจากพาร์ทเนอร์ ที่เหมาะกับสินค้าในร้านคุณ</p>
        </div>
        <div role="group" aria-label="กรองตามสินค้า" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {filters.map((f) => {
            const active = f.id === productId;
            return (
              <button
                key={f.id ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => setProductId(f.id)}
                className={`inline-flex min-h-[40px] flex-none items-center whitespace-nowrap rounded-full px-4 text-[15px] ${
                  active ? "bg-brand font-semibold text-white" : "border border-line bg-surface text-ink-body hover:border-brand hover:text-brand"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {sponsors.error && <p className="m-0 rounded-3xl bg-danger-soft p-6 text-expense">โหลดข้อเสนอไม่สำเร็จ: {sponsors.error.message}</p>}
      {!sponsors.data && !sponsors.error && <p className="m-0 rounded-3xl bg-surface p-6 text-center text-ink-muted">กำลังโหลดข้อเสนอ…</p>}
      {sponsors.data?.length === 0 && (
        <p className="m-0 rounded-3xl bg-surface p-6 text-center text-ink-muted">ยังไม่มีข้อเสนอสำหรับสินค้านี้</p>
      )}

      {sponsors.data && sponsors.data.length > 0 && (
        <ul
          aria-busy={sponsors.isPlaceholderData}
          className={`m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-5 p-0 ${sponsors.isPlaceholderData ? "opacity-60" : ""}`}
        >
          {sponsors.data.map((s) => (
            <li key={s.listing_id} className="flex flex-col gap-3 rounded-[28px] border-2 border-[#FFE7A3] dark:border-sun/30 bg-surface p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-sun-soft px-3 py-0.5 text-[13px] font-bold text-sun-ink">ผู้สนับสนุน</span>
                <span className="text-sm text-ink-muted">{s.sponsor_type}</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-brand">{s.sponsor_name}</div>
                <h3 className="m-0 text-lg font-semibold leading-snug">{s.product_name}</h3>
              </div>
              <p className="m-0 text-[15px] text-ink-body">{s.description}</p>
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-2xl font-bold text-ink">
                  {formatBaht(s.price)}
                  <span className="text-base font-normal text-ink-muted">/{s.unit}</span>
                </span>
                <span className="text-sm text-ink-muted">
                  สั่งขั้นต่ำ {s.moq} {s.unit}
                </span>
              </div>
              {s.target_product_ids.length > 0 && (
                <div className="flex flex-wrap gap-1.5 text-sm">
                  <span className="text-ink-muted">เหมาะกับ</span>
                  {s.target_product_ids.map((id) => (
                    <span key={id} className="rounded-full bg-brand-soft px-2.5 py-0.5 font-semibold text-ink">
                      {productName(id) ?? id}
                    </span>
                  ))}
                </div>
              )}
              <Link
                href={`/market/sponsors/${s.listing_id}`}
                onClick={() => sponsorClick.mutate(s.listing_id)}
                className="mt-auto inline-flex min-h-[46px] items-center justify-center rounded-full bg-brand px-5 font-semibold text-white no-underline"
              >
                ดูข้อเสนอ
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

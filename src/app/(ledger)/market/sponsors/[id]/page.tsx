"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useMarketProducts } from "@/hooks/market/useMarketProducts";
import { useSponsor } from "@/hooks/market/useSponsor";
import { formatBaht } from "@/lib/format";

/** One sponsored offer in full, so the shop can read it before leaving for the sponsor's site. */
export default function SponsorOfferPage() {
  const { id } = useParams<{ id: string }>();
  const offer = useSponsor(id);
  const products = useMarketProducts();
  const productName = (pid: string) => products.data?.find((p) => p.product_id === pid)?.product_name ?? pid;

  const back = (
    <Link href="/market/sponsors" className="self-start text-[15px] font-semibold text-brand no-underline hover:underline">
      ← ข้อเสนอทั้งหมด
    </Link>
  );

  if (offer.error)
    return (
      <div className="flex flex-col gap-4">
        {back}
        <p className="m-0 rounded-3xl bg-surface p-6 text-center text-ink-muted">ไม่พบข้อเสนอนี้</p>
      </div>
    );
  if (!offer.data) return <p className="m-0 rounded-3xl bg-surface p-6 text-center text-ink-muted">กำลังโหลดข้อเสนอ…</p>;

  const s = offer.data;
  return (
    <div className="flex flex-col gap-4">
      {back}
      <article className="flex flex-col gap-5 rounded-[28px] border-2 border-[#FFE7A3] dark:border-sun/30 bg-surface p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sun-soft px-3 py-0.5 text-[13px] font-bold text-sun-ink">ผู้สนับสนุน</span>
          <span className="text-sm text-ink-muted">{s.sponsor_type}</span>
        </div>
        <div>
          <div className="text-[15px] font-semibold text-brand">{s.sponsor_name}</div>
          <h2 className="m-0 text-2xl font-bold leading-snug md:text-[28px]">{s.product_name}</h2>
        </div>
        <p className="m-0 text-base text-ink-body">{s.description}</p>

        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">
          <div className="rounded-2xl bg-brand-tint px-4 py-3">
            <dt className="text-sm text-ink-muted">ราคา</dt>
            <dd className="m-0 text-xl font-bold text-ink">
              {formatBaht(s.price)}
              <span className="text-[15px] font-normal text-ink-muted">/{s.unit}</span>
            </dd>
          </div>
          <div className="rounded-2xl bg-brand-tint px-4 py-3">
            <dt className="text-sm text-ink-muted">สั่งขั้นต่ำ</dt>
            <dd className="m-0 text-xl font-bold text-ink">
              {s.moq} {s.unit}
            </dd>
          </div>
          <div className="rounded-2xl bg-brand-tint px-4 py-3">
            <dt className="text-sm text-ink-muted">ยอดสั่งขั้นต่ำ</dt>
            <dd className="m-0 text-xl font-bold text-ink">{formatBaht(s.price * s.moq)}</dd>
          </div>
        </dl>

        {s.target_product_ids.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[15px]">
            <span className="text-ink-muted">เหมาะกับสินค้าในร้าน</span>
            {s.target_product_ids.map((pid) => (
              <span key={pid} className="rounded-full bg-brand-soft px-3 py-0.5 font-semibold text-ink">
                {productName(pid)}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1.5 border-t border-line-subtle pt-5">
          <a
            href={s.cta_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center self-start rounded-full bg-brand px-6 font-semibold text-white no-underline"
          >
            ไปที่เว็บไซต์ผู้ขาย ↗
          </a>
          <span className="text-sm text-ink-muted">ลิงก์นี้จะเปิดเว็บไซต์ของผู้สนับสนุนในแท็บใหม่</span>
        </div>
      </article>
    </div>
  );
}

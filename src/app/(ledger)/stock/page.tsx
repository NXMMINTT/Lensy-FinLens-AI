"use client";

import { useState } from "react";

import { AddProductForm } from "@/components/stock/AddProductForm";
import { ProductRow } from "@/components/stock/ProductRow";
import { stockInputClass } from "@/components/stock/stockInputClass";
import { LOW_STOCK_QTY } from "@/components/StockBadge";
import { Card } from "@/components/ui/Card";
import { useProducts } from "@/hooks/dashboard/useProducts";
import { formatTHB } from "@/lib/format";
import { useLocale } from "@/lib/i18n";

function Summary({ label, value, tone = "text-ink" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-[22px] bg-surface px-5 py-4">
      <div className="text-[13px] text-ink-muted">{label}</div>
      <div className={`text-[24px] font-bold leading-snug ${tone}`}>{value}</div>
    </div>
  );
}

export default function StockPage() {
  const th = useLocale();
  const { data, isLoading, error } = useProducts();
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");

  const products = data ?? [];
  const shown = products.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));
  const outOfStock = products.filter((p) => Number(p.stock_qty) <= 0).length;
  const low = products.filter((p) => Number(p.stock_qty) > 0 && Number(p.stock_qty) <= LOW_STOCK_QTY).length;
  const stockValue = products.reduce((sum, p) => sum + Math.max(0, Number(p.stock_qty)) * Number(p.unit_cost ?? 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold md:text-[30px]">{th.stock.title}</h1>
          <p className="m-0 text-[14px] text-ink-muted">ขายแล้วสต็อกลด ซื้อเข้าสต็อกเพิ่มเอง · ปรับเองได้เมื่อนับของจริงไม่ตรง</p>
        </div>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="min-h-[46px] rounded-full bg-brand px-6 font-bold text-white">
            + เพิ่มสินค้า
          </button>
        )}
      </div>

      {adding && <AddProductForm onDone={() => setAdding(false)} />}

      {products.length > 0 && (
        <section aria-label="สรุปสต็อก" className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Summary label="สินค้าทั้งหมด" value={`${products.length} รายการ`} />
          <Summary label="หมด / ติดลบ" value={`${outOfStock} รายการ`} tone={outOfStock > 0 ? "text-expense" : "text-ink"} />
          <Summary label="ใกล้หมด" value={`${low} รายการ`} tone={low > 0 ? "text-sun-ink" : "text-ink"} />
          <Summary label="มูลค่าสต็อก (ตามต้นทุน)" value={formatTHB(stockValue)} tone="text-brand" />
        </section>
      )}

      {error && <Card className="border-danger-line bg-danger-soft text-sm text-danger-ink">{error.message}</Card>}
      {isLoading && <Card className="text-center text-sm text-ink-muted">{th.myBusiness.loading}</Card>}
      {data?.length === 0 && !adding && <Card className="text-center text-sm text-ink-muted">{th.stock.empty}</Card>}

      {products.length > 0 && (
        <>
          <label className="block">
            <span className="sr-only">ค้นหาสินค้า</span>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาสินค้า…" className={stockInputClass} />
          </label>
          <div className="flex flex-col divide-y divide-line-subtle overflow-hidden rounded-[28px] bg-surface">
            {shown.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
            {shown.length === 0 && <p className="m-0 px-6 py-5 text-center text-ink-muted">ไม่พบสินค้าชื่อ “{search}”</p>}
          </div>
        </>
      )}
    </div>
  );
}

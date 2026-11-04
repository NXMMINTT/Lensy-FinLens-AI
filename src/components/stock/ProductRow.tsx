"use client";

import { useState } from "react";

import { ProductEditForm } from "@/components/stock/ProductEditForm";
import { StockAdjustPanel } from "@/components/stock/StockAdjustPanel";
import { StockBadge } from "@/components/StockBadge";
import { LineIcon } from "@/components/ui/LineIcon";
import { formatQty, formatTHB } from "@/lib/format";
import { productImageSrc } from "@/lib/productImageSrc";
import type { ProductItem } from "@/types/dashboard";

/** One product with its stock, plus buttons to recount it or edit/delete it inline. */
export function ProductRow({ product }: { product: ProductItem }) {
  const [open, setOpen] = useState<"adjust" | "edit" | null>(null);
  const qty = Number(product.stock_qty);
  const value = product.unit_cost === null ? null : qty * Number(product.unit_cost);
  const photo = productImageSrc(product.image_url, product.name);

  return (
    <div className="flex flex-col gap-3 px-5 py-4 md:px-6">
      <div className="flex flex-wrap items-center gap-3.5">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- product photo
          <img src={photo} alt="" className="h-[52px] w-[52px] shrink-0 rounded-[18px] object-cover" />
        ) : (
          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[18px] bg-brand-soft text-brand">
            <LineIcon name="box" size={24} />
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-2 font-semibold">
            {product.name} <StockBadge stockQty={product.stock_qty} />
          </span>
          <span className="text-[13px] text-ink-muted">
            ต้นทุน/หน่วย {product.unit_cost === null ? "ยังไม่ระบุ" : formatTHB(product.unit_cost)}
            {value !== null && qty > 0 && ` · มูลค่าสต็อก ${formatTHB(value)}`}
          </span>
        </div>
        <span className={`text-[17px] font-bold ${qty < 0 ? "text-expense" : "text-ink"}`}>
          {formatQty(product.stock_qty)} {product.unit}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            aria-expanded={open === "adjust"}
            onClick={() => setOpen(open === "adjust" ? null : "adjust")}
            className="min-h-[40px] rounded-full bg-brand px-4 text-[14px] font-bold text-white"
          >
            ปรับสต็อก
          </button>
          <button
            type="button"
            aria-expanded={open === "edit"}
            onClick={() => setOpen(open === "edit" ? null : "edit")}
            className="min-h-[40px] rounded-full border-2 border-sky-line px-4 text-[14px] font-bold text-ink"
          >
            แก้ไข
          </button>
        </div>
      </div>
      {qty < 0 && open === null && (
        <p className="m-0 rounded-xl bg-danger-soft px-4 py-2.5 text-[13px] text-expense">
          สต็อกติดลบ แปลว่าขายไปมากกว่าที่บันทึกซื้อเข้า กด “ปรับสต็อก” แล้วใส่จำนวนที่นับได้จริง
        </p>
      )}
      {open === "adjust" && <StockAdjustPanel product={product} onDone={() => setOpen(null)} />}
      {open === "edit" && <ProductEditForm product={product} onDone={() => setOpen(null)} />}
    </div>
  );
}

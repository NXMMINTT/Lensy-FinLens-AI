"use client";

import { useState } from "react";

import { ProductImagePicker } from "@/components/stock/ProductImagePicker";
import { stockInputClass } from "@/components/stock/stockInputClass";
import { useProductActions } from "@/hooks/dashboard/useProductActions";
import { productImageSrc } from "@/lib/productImageSrc";
import type { ProductItem } from "@/types/dashboard";

/** Change a product's photo, rename it, change its unit or cost, or delete it when nothing has been sold or bought under it yet. */
export function ProductEditForm({ product, onDone }: { product: ProductItem; onDone: () => void }) {
  const { update, remove, uploadImage, removeImage } = useProductActions();
  const [name, setName] = useState(product.name);
  const [unit, setUnit] = useState(product.unit);
  const [unitCost, setUnitCost] = useState(product.unit_cost === null ? "" : String(Number(product.unit_cost)));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const error = update.error ?? remove.error ?? uploadImage.error ?? removeImage.error;

  return (
    <form
      className="flex flex-col gap-3.5 rounded-2xl bg-brand-tint p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await update.mutateAsync({ id: product.id, body: { name, unit, unit_cost: unitCost === "" ? null : unitCost } });
        onDone();
      }}
    >
      <ProductImagePicker
        src={productImageSrc(product.image_url, product.name)}
        busy={uploadImage.isPending || removeImage.isPending}
        onPick={(file) => uploadImage.mutate({ id: product.id, file })}
        onRemove={product.image_url ? () => removeImage.mutate(product.id) : undefined}
      />
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <label className="flex flex-col gap-1.5 text-[14px] font-bold text-ink">
          ชื่อสินค้า
          <input required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} className={stockInputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-[14px] font-bold text-ink">
          หน่วย
          <input required maxLength={50} value={unit} onChange={(e) => setUnit(e.target.value)} className={stockInputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-[14px] font-bold text-ink">
          ต้นทุน/หน่วย (บาท)
          <input type="number" min="0" step="0.01" inputMode="decimal" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="ไม่ระบุ" className={stockInputClass} />
        </label>
      </div>
      {error && <p className="m-0 rounded-xl bg-danger-soft px-4 py-3 text-sm text-expense">{error.message}</p>}
      <div className="flex flex-wrap items-center gap-2.5">
        <button type="button" onClick={onDone} className="min-h-[42px] rounded-full border-2 border-sky-line bg-surface px-5 text-[14px] font-bold text-ink-body">
          ยกเลิก
        </button>
        <button type="submit" disabled={update.isPending || !name.trim() || !unit.trim()} className="min-h-[42px] rounded-full bg-brand px-5 text-[14px] font-bold text-white disabled:opacity-50">
          {update.isPending ? "กำลังบันทึก…" : "บันทึก"}
        </button>
        <span className="flex-1" />
        {confirmDelete ? (
          <span className="flex items-center gap-2 text-[14px]">
            ลบ “{product.name}” ใช่ไหม?
            <button
              type="button"
              disabled={remove.isPending}
              onClick={async () => {
                await remove.mutateAsync(product.id);
                onDone();
              }}
              className="min-h-[42px] rounded-full bg-expense-solid px-4 font-bold text-white disabled:opacity-50"
            >
              ลบเลย
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="min-h-[42px] px-2 font-semibold text-ink-muted">
              ไม่ลบ
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmDelete(true)} className="min-h-[42px] rounded-full px-4 text-[14px] font-bold text-expense">
            ลบสินค้า
          </button>
        )}
      </div>
    </form>
  );
}

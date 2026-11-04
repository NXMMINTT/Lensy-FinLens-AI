"use client";

import { useEffect, useState } from "react";

import { ProductImagePicker } from "@/components/stock/ProductImagePicker";
import { stockInputClass } from "@/components/stock/stockInputClass";
import { useProductActions } from "@/hooks/dashboard/useProductActions";

/** New product with its photo, unit, cost and how many are in stock right now. */
export function AddProductForm({ onDone }: { onDone: () => void }) {
  const { create, uploadImage } = useProductActions();
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("ชิ้น");
  const [unitCost, setUnitCost] = useState("");
  const [stockQty, setStockQty] = useState("");

  useEffect(() => {
    if (!photo) return setPreview(null);
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  return (
    <form
      className="flex flex-col gap-4 rounded-[28px] border-2 border-brand bg-surface p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const product = await create.mutateAsync({
          name,
          unit,
          unit_cost: unitCost === "" ? null : unitCost,
          stock_qty: stockQty === "" ? "0" : stockQty,
        });
        if (photo) await uploadImage.mutateAsync({ id: product.id, file: photo });
        onDone();
      }}
    >
      <h2 className="m-0 text-[18px] font-bold text-ink">เพิ่มสินค้าใหม่</h2>
      <ProductImagePicker src={preview} onPick={setPhoto} onRemove={() => setPhoto(null)} />
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <label className="flex flex-col gap-1.5 text-[14px] font-bold text-ink">
          ชื่อสินค้า <span className="sr-only">(ต้องกรอก)</span>
          <input required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น น้ำพริกเผา" className={stockInputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-[14px] font-bold text-ink">
          หน่วย
          <input required maxLength={50} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="เช่น กระปุก" className={stockInputClass} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[14px] font-bold text-ink">
          ต้นทุนต่อหน่วย (บาท, ไม่บังคับ)
          <input type="number" min="0" step="0.01" inputMode="decimal" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0.00" className={stockInputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-[14px] font-bold text-ink">
          จำนวนในสต็อกตอนนี้
          <input type="number" min="0" step="any" inputMode="decimal" value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder="0" className={stockInputClass} />
        </label>
      </div>
      {(create.error ?? uploadImage.error) && (
        <p className="m-0 rounded-xl bg-danger-soft px-4 py-3 text-sm text-expense">{(create.error ?? uploadImage.error)?.message}</p>
      )}
      <div className="flex gap-2.5">
        <button type="button" onClick={onDone} className="min-h-[46px] rounded-full border-2 border-sky-line px-6 font-bold text-ink-body">
          ยกเลิก
        </button>
        <button type="submit" disabled={create.isPending || uploadImage.isPending || !name.trim()} className="min-h-[46px] rounded-full bg-brand px-6 font-bold text-white disabled:opacity-50">
          {create.isPending || uploadImage.isPending ? "กำลังเพิ่ม…" : "เพิ่มสินค้า"}
        </button>
      </div>
    </form>
  );
}

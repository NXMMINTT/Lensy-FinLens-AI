"use client";

import { useState } from "react";

import { stockInputClass } from "@/components/stock/stockInputClass";
import { useProductActions } from "@/hooks/dashboard/useProductActions";
import { formatQty } from "@/lib/format";
import type { ProductItem } from "@/types/dashboard";

/** Manual stock correction: add, remove, or set the counted quantity. Sales and purchases still move stock on their own. */
export function StockAdjustPanel({ product, onDone }: { product: ProductItem; onDone: () => void }) {
  const { adjust } = useProductActions();
  const [mode, setMode] = useState<"add" | "remove" | "set">("set");
  const [quantity, setQuantity] = useState("");

  const current = Number(product.stock_qty);
  const qty = Number(quantity);
  const after = mode === "set" ? qty : mode === "add" ? current + qty : current - qty;
  const valid = quantity !== "" && qty >= 0 && !(mode !== "set" && qty === 0);

  return (
    <form
      className="flex flex-col gap-3.5 rounded-2xl bg-brand-tint p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const body = mode === "set" ? { set_to: quantity } : { change: mode === "add" ? quantity : `-${quantity}` };
        await adjust.mutateAsync({ id: product.id, body });
        onDone();
      }}
    >
      <div role="radiogroup" aria-label="วิธีปรับสต็อก" className="flex flex-wrap gap-2">
        {(
          [
            ["set", "ตั้งเป็นจำนวนที่นับได้"],
            ["add", "+ เพิ่ม"],
            ["remove", "− ลด"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={mode === value}
            onClick={() => setMode(value)}
            className={`min-h-[40px] rounded-full border-2 px-4 text-[14px] font-semibold ${
              mode === value ? "border-brand bg-brand text-white" : "border-sky-line bg-surface text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1.5 text-[14px] font-bold text-ink sm:max-w-[50%]">
        {mode === "set" ? `นับได้จริงกี่${product.unit}` : `จำนวน (${product.unit})`}
        <input
          type="number"
          required
          min="0"
          step="any"
          inputMode="decimal"
          autoFocus
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={stockInputClass}
        />
      </label>
      <p className="m-0 text-[14px] text-ink-body">
        ตอนนี้ <b>{formatQty(product.stock_qty)}</b> → หลังปรับ{" "}
        <b className={valid && after < 0 ? "text-expense" : "text-brand"}>{valid ? formatQty(after) : "–"}</b> {product.unit}
      </p>
      {adjust.error && <p className="m-0 rounded-xl bg-danger-soft px-4 py-3 text-sm text-expense">{adjust.error.message}</p>}
      <div className="flex gap-2.5">
        <button type="button" onClick={onDone} className="min-h-[42px] rounded-full border-2 border-sky-line bg-surface px-5 text-[14px] font-bold text-ink-body">
          ยกเลิก
        </button>
        <button type="submit" disabled={!valid || adjust.isPending} className="min-h-[42px] rounded-full bg-brand px-5 text-[14px] font-bold text-white disabled:opacity-50">
          {adjust.isPending ? "กำลังบันทึก…" : "บันทึกสต็อก"}
        </button>
      </div>
    </form>
  );
}

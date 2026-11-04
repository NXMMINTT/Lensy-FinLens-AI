"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { UFox } from "@/components/brand/UFox";
import { CategoryLineIcon } from "@/components/transactions/CategoryLineIcon";
import { EntryTypeIcon } from "@/components/transactions/EntryTypeIcon";
import { useCategories } from "@/hooks/dashboard/useCategories";
import { useCreateTransaction } from "@/hooks/dashboard/useCreateTransaction";
import { useProducts } from "@/hooks/dashboard/useProducts";
import { localIsoDate } from "@/lib/localIsoDate";
import type { EntryType } from "@/types/dashboard";

const OTHER = "อื่นๆ";

const inputClass =
  "min-h-[52px] w-full rounded-xl border-2 border-sky-line bg-surface px-4 text-[16px] text-ink placeholder:text-[#8A97B1] focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 disabled:cursor-not-allowed disabled:border-line disabled:bg-line-subtle";

function Field({ label, hint, required = false, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[15px] font-bold text-ink">
        {label}
        {required && <span className="ml-0.5 text-expense">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[13px] text-ink-muted">{hint}</span>}
    </label>
  );
}

/** New income/expense typed on the web (/transactions?mode=income|expense). Saved as confirmed right away. */
export function TransactionEntryForm({ mode }: { mode: EntryType }) {
  const router = useRouter();
  const isIncome = mode === "income";
  const categories = useCategories(mode);
  const create = useCreateTransaction();
  const products = useProducts();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [txnDate, setTxnDate] = useState(() => localIsoDate(new Date()));

  const categoryNames = [...(categories.data ?? []).map((c) => c.name), OTHER].filter((n, i, all) => all.indexOf(n) === i);
  const knownProduct = products.data?.find((p) => p.name.toLowerCase() === product.trim().toLowerCase());
  const canSave = Number(amount) > 0 && description.trim() !== "" && !create.isPending;

  const handleSubmit = async () => {
    if (!canSave) return;
    const details = [description.trim(), note.trim()].filter(Boolean).join(" · ");
    await create.mutateAsync({
      type: mode,
      amount,
      description: details,
      txn_date: txnDate,
      category,
      product_name: product.trim() || null,
      quantity: product.trim() && quantity ? quantity : null,
    });
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header with mascot */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-deep to-brand-tint px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[17px] font-bold leading-snug text-ink">
              {isIncome ? "บันทึกรายรับกันเลยครับ!" : "บันทึกรายจ่ายกันเลยครับ!"}
            </p>
            <p className="m-0 mt-1 text-[14px] leading-snug text-ink-muted">
              เลือกหมวดหมู่ แล้วใส่จำนวนเงิน<br />ได้เลยครับ
            </p>
          </div>
          <UFox size={90} pose="ledger" className="-mr-2 shrink-0" />
        </div>
      </section>

      {/* Form */}
      <form
        className="rounded-[28px] bg-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] md:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="mb-6 flex items-center gap-3 border-b border-line pb-5">
          <EntryTypeIcon type={mode} />
          <div>
            <h2 className="m-0 text-xl font-bold text-ink">{isIncome ? "รายรับ" : "รายจ่าย"}</h2>
            <p className="m-0 text-[13px] text-ink-muted">
              ช่องที่มี <span className="text-expense">*</span> ต้องกรอก
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="วันที่" required>
              <input type="date" required value={txnDate} onChange={(e) => setTxnDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="จำนวนเงิน" required>
              <span className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-bold text-brand">฿</span>
                <input
                  type="number"
                  required
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className={`${inputClass} pl-10 text-[18px] font-semibold`}
                />
              </span>
            </Field>
          </div>

          <Field label="รายการ" required>
            <input
              type="text"
              required
              maxLength={300}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isIncome ? "เช่น ขายน้ำพริก 20 กระปุก" : "เช่น ซื้อพริกแห้ง"}
              className={inputClass}
            />
          </Field>

          <div>
            <span className="mb-2 block text-[15px] font-bold text-ink">
              หมวดหมู่ <span className="text-[13px] font-normal text-ink-muted">(เลือก 1 อย่าง กดซ้ำเพื่อยกเลิก)</span>
            </span>
            <div role="radiogroup" aria-label="หมวดหมู่" className="flex flex-wrap gap-2.5">
              {categoryNames.map((name) => {
                const active = category === name;
                return (
                  <button
                    key={name}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setCategory(active ? null : name)}
                    className={`flex min-h-[48px] items-center gap-2 rounded-full border-2 px-4 text-[15px] font-semibold transition-colors ${
                      active ? "border-brand bg-brand text-white" : "border-sky-line bg-surface text-ink hover:border-brand"
                    }`}
                  >
                    <CategoryLineIcon name={name} className={active ? "text-white" : "text-brand"} />
                    {name}
                    {active && <span aria-hidden="true">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl bg-brand-tint p-4">
            <div>
              <b className="text-[15px] text-ink">สินค้า (ไม่บังคับ)</b>
              <p className="m-0 text-[13px] text-ink-muted">
                {isIncome ? "ใส่ชื่อสินค้ากับจำนวนที่ขาย ระบบจะตัดสต็อกให้" : "ใส่ชื่อสินค้ากับจำนวนที่ซื้อเข้า ระบบจะเพิ่มสต็อกและคิดต้นทุนให้"}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              <Field label="ชื่อสินค้า">
                <input
                  type="text"
                  maxLength={200}
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="พิมพ์หรือเลือกจากรายการ"
                  list="product-options"
                  className={inputClass}
                />
                <datalist id="product-options">
                  {(products.data ?? []).map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
                {product.trim() && (
                  <span className={`mt-1.5 block text-[13px] ${knownProduct ? "text-income" : "text-sun-ink"}`}>
                    {knownProduct
                      ? `✓ สินค้าในสต็อก (เหลือ ${Number(knownProduct.stock_qty).toLocaleString("en-US")} ${knownProduct.unit})`
                      : "สินค้าใหม่ จะเพิ่มเข้ารายการสินค้าให้"}
                  </span>
                )}
              </Field>
              <Field label={knownProduct ? `จำนวน (${knownProduct.unit})` : "จำนวน"}>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  inputMode="decimal"
                  value={quantity}
                  disabled={!product.trim()}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={product.trim() ? "เช่น 20" : "ใส่ชื่อสินค้าก่อน"}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <Field label="โน้ตเพิ่มเติม (ไม่บังคับ)">
            <input
              type="text"
              maxLength={190}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ลูกค้าประจำ, จ่ายเงินสด"
              className={inputClass}
            />
          </Field>
        </div>

        {create.error && <p className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-sm text-expense">{create.error.message}</p>}

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="min-h-[52px] flex-1 rounded-full border-2 border-sky-line bg-surface text-[16px] font-bold text-ink-body"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className={`min-h-[52px] flex-1 rounded-full text-[16px] font-bold text-white disabled:opacity-50 ${isIncome ? "bg-income-solid" : "bg-[#FF4081]"}`}
          >
            {create.isPending ? "กำลังบันทึก…" : isIncome ? "บันทึกรายรับ" : "บันทึกรายจ่าย"}
          </button>
        </div>
      </form>
    </div>
  );
}

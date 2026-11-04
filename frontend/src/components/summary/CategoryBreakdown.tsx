"use client";

import Link from "next/link";

import { CategoryLineIcon } from "@/components/transactions/CategoryLineIcon";
import { useCategoryTotals } from "@/hooks/dashboard/useCategoryTotals";
import { formatBaht } from "@/lib/format";
import type { EntryType } from "@/types/dashboard";

const BAR_COLORS = ["bg-brand", "bg-navy", "bg-[#12804F]", "bg-[#9C27B0]", "bg-[#9E9E9E]"];

/** A month's income or expense split by category, with each category's share. */
export function CategoryBreakdown({ month, type }: { month: string; type: EntryType }) {
  const { data, isLoading, error } = useCategoryTotals(month, type);
  const sum = (data ?? []).reduce((acc, c) => acc + Number(c.total), 0);

  return (
    <section className="rounded-[28px] bg-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="m-0 text-[18px] font-bold text-ink">{type === "income" ? "รายรับตามหมวดหมู่" : "รายจ่ายตามหมวดหมู่"}</h2>
        <Link href="/transactions" className="text-[14px] font-semibold text-brand no-underline">
          ดูทั้งหมด &gt;
        </Link>
      </div>

      {error && <p className="m-0 text-expense">โหลดข้อมูลไม่สำเร็จ: {error.message}</p>}
      {isLoading && <p className="m-0 text-ink-muted">กำลังโหลด…</p>}
      {data?.length === 0 && <p className="m-0 text-ink-muted">ยังไม่มี{type === "income" ? "รายรับ" : "รายจ่าย"}ที่ยืนยันแล้วในเดือนนี้</p>}

      <div className="flex flex-col gap-4">
        {(data ?? []).map((c, i) => {
          const pct = sum > 0 ? Math.round((Number(c.total) / sum) * 100) : 0;
          return (
            <div key={c.category} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <CategoryLineIcon name={c.category} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-ink">{c.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-ink">{formatBaht(c.total)}</span>
                    <span className="text-[12px] text-ink-muted">{pct}%</span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-line-subtle">
                  <div className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

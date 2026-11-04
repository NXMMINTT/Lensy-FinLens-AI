"use client";

import Link from "next/link";

import { LineAddFriendButton } from "@/components/brand/LineAddFriendButton";
import { useTransactionActions } from "@/hooks/dashboard/useTransactionActions";
import { formatBaht } from "@/lib/format";
import type { TransactionItem } from "@/types/dashboard";

/** The first entry from LINE still waiting for the owner to confirm. */
export function PendingCard({ pending }: { pending: TransactionItem[] }) {
  const { confirm } = useTransactionActions();
  const first = pending[0];

  return (
    <section aria-label="รอยืนยัน" className="flex flex-col gap-4 rounded-[28px] bg-surface p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-[21px] font-semibold">รอคุณยืนยัน{pending.length > 1 ? ` (${pending.length})` : ""}</h2>
        <Link href="/transactions" className="text-[15px] font-semibold no-underline">
          ดูทั้งหมด
        </Link>
      </div>
      {first ? (
        <div className="flex flex-col gap-3 rounded-[22px] bg-brand-tint p-5">
          <div>
            <div className="font-semibold">{first.description ?? first.product_name ?? (first.type === "income" ? "รายรับ" : "รายจ่าย")}</div>
            <div className="text-[15px] text-ink-muted">
              {first.type === "income" ? "รายรับ" : "รายจ่าย"} {formatBaht(first.amount)} · จาก LINE
            </div>
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={confirm.isPending}
              onClick={() => confirm.mutate(first.id)}
              className="min-h-[46px] flex-1 rounded-full bg-brand font-semibold text-white disabled:opacity-60"
            >
              ยืนยัน
            </button>
            <Link
              href={`/transactions?edit=${first.id}`}
              className="inline-flex min-h-[46px] flex-1 items-center justify-center rounded-full border-2 border-sky-line bg-surface font-semibold text-ink no-underline"
            >
              แก้ไข
            </Link>
          </div>
          {confirm.error && <p className="m-0 text-sm text-expense">{confirm.error.message}</p>}
        </div>
      ) : (
        <p className="m-0 text-ink-muted">ไม่มีรายการค้าง ส่งสลิปหรืออัดเสียงใน LINE แล้วรายการจะมารอตรงนี้</p>
      )}
      <LineAddFriendButton label="ส่งสลิปหรืออัดเสียงใน LINE" className="justify-center" />
    </section>
  );
}

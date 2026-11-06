"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { FundSummary } from "@/lib/fundSummary";
import { pct } from "@/lib/money";

import { Icon } from "../Icon";
import { SampleBadge } from "../SampleBadge";
import { DataStatusBadge } from "./DataStatusBadge";

/**
 * Search + fund cards. Order is the data order (by code), never a ranking.
 * Each card shows only the two numbers people compare at a glance; the sources, risks and every
 * fee layer are on the fund's own page, which the whole card opens.
 */
export function FundBrowser({ funds }: { funds: FundSummary[] }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return funds;
    return funds.filter((f) => [f.code, f.nameTh, f.amc ?? "", f.type ?? ""].some((v) => v.toLowerCase().includes(s)));
  }, [funds, q]);

  return (
    <div className="flex flex-col gap-4">
      <label className="relative block">
        <span className="sr-only">ค้นหากองทุน</span>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
          <Icon name="search" size={20} />
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาชื่อกอง รหัสกอง หรือ บลจ."
          className="min-h-[52px] w-full rounded-2xl border border-line bg-surface pl-12 pr-4 text-[17px] text-ink placeholder:text-ink-faint focus:border-brand"
        />
      </label>

      {shown.length === 0 ? (
        <p className="m-0 rounded-2xl border border-line bg-surface p-6 text-ink-body">ไม่พบกองที่ค้นหา ตอนนี้มีเฉพาะกองที่ทีมตรวจข้อมูลแล้วค่ะ</p>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((f) => {
            const hiddenCost = f.masterCostElsewhere || f.hiddenInProspectus;
            return (
              <li
                key={f.code}
                className="group relative flex flex-col overflow-hidden rounded-[22px] border border-line bg-surface transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-[0_14px_30px_-18px_rgba(20,46,34,.45)]"
              >
                <div className="flex flex-col gap-2 px-5 pb-4 pt-5">
                  <span className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[12px] font-bold tracking-wide text-brand">{f.code}</span>
                    <span className="flex items-center gap-1.5">
                      {f.isSample && <SampleBadge />}
                      {f.isFeeder && <span className="text-[12px] text-ink-muted">Feeder Fund</span>}
                    </span>
                  </span>
                  <h2 className="m-0 line-clamp-2 min-h-[2.75em] text-[16.5px] font-bold leading-snug">
                    {/* the link covers the whole card */}
                    <Link href={`/funds/${encodeURIComponent(f.code)}`} className="text-ink no-underline after:absolute after:inset-0">
                      {f.nameTh}
                    </Link>
                  </h2>
                  <span className="truncate text-[13px] text-ink-muted">{f.amc ?? " "}</span>
                  {!f.isSample && f.status.kind !== "verified" && <DataStatusBadge status={f.status} chipOnly />}
                </div>

                <div className="mt-auto flex flex-col gap-2 border-t border-line-subtle px-5 py-4">
                  <div className="flex items-end justify-between gap-3">
                    <span className="flex flex-col">
                      <span className="text-[12px] text-ink-muted">ต้นทุนต่อปีรวม</span>
                      {f.annualCostRate === null ? (
                        <span className="text-[14px] text-ink-muted">ไม่พบในเอกสาร</span>
                      ) : (
                        <b className="text-[26px] leading-tight text-brand">{pct(f.annualCostRate)}</b>
                      )}
                    </span>
                    <span className="flex flex-col items-end">
                      <span className="text-[12px] text-ink-muted">ความเสี่ยง</span>
                      {f.riskLevel ? (
                        <b className="text-[20px] leading-tight text-ink">
                          {f.riskLevel.value}
                          <span className="text-[13px] font-medium text-ink-faint">/8</span>
                        </b>
                      ) : (
                        <span className="text-[14px] text-ink-muted">ไม่พบ</span>
                      )}
                    </span>
                  </div>
                  {hiddenCost && (
                    <span className="text-[12.5px] text-sun-ink">
                      <Icon name="warn" size={14} className="mr-1" />
                      รวมค่าใช้จ่ายกองหลักที่ Factsheet ไม่ได้แสดงแล้ว
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-line-subtle bg-brand-tint/60 px-5 py-3 text-[14px] font-bold text-brand">
                  ดูรายละเอียด
                  <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

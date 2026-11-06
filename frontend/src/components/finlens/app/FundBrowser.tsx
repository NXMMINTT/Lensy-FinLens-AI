"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { FundSummary } from "@/lib/fundSummary";
import { pct } from "@/lib/money";

import { SampleBadge } from "../SampleBadge";
import { DataStatusBadge } from "./DataStatusBadge";
import { MASTER_COST_NOTE, NOT_IN_DOCS } from "@/lib/disclaimer";
import type { DocSource } from "@/lib/schema";
import { sourceRef } from "@/lib/sources";

/** A figure without a page yet: say where it came from. */
function NoPageTag({ source }: { source: DocSource }) {
  return <span className="inline-flex self-start rounded-md bg-sun-soft px-1.5 py-0.5 text-[12px] text-sun-ink">{sourceRef(null, source)} · ยังไม่มีเลขหน้า</span>;
}
import { Icon } from "../Icon";
import { RiskBadge, RiskMeter, SourceChip } from "./ui";

/** Search + fund cards. Order is the data order (by code), never a ranking. */
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
        <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
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
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
          {shown.map((f) => (
            <li key={f.code} className="flex flex-col gap-4 rounded-[24px] border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-muted">
                    <span className="font-semibold">{f.code}</span>
                    {f.isFeeder && <span className="rounded-md bg-sky px-1.5 py-0.5 text-[11px] font-semibold text-ink-body">Feeder Fund</span>}
                    {f.isSample && <SampleBadge />}
                  </div>
                  <h2 className="m-0 mt-1 text-[21px] font-bold leading-snug">
                    <Link href={`/funds/${encodeURIComponent(f.code)}`} className="text-ink no-underline hover:text-brand">
                      {f.nameTh}
                    </Link>
                  </h2>
                  <p className="m-0 text-[14px] text-ink-muted">{[f.amc, f.type].filter(Boolean).join(" · ")}</p>
                  <div className="mt-2">
                    <DataStatusBadge status={f.status} compact />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-brand-tint p-3.5">
                <div className="flex flex-col gap-1">
                  <span className="text-[12.5px] text-ink-muted">ต้นทุนต่อปีรวม</span>
                  {f.annualCostRate === null ? (
                    <span className="text-[13px] text-ink-muted">{NOT_IN_DOCS}</span>
                  ) : (
                    <>
                      <b className="font-heading text-[26px] leading-none text-brand">{pct(f.annualCostRate)}</b>
                      <span className="flex flex-wrap gap-1">
                        {f.costRefs.map((r) => (
                          <SourceChip key={`${r.source}${r.page}`} {...r} />
                        ))}
                        {f.costSourcesWithoutPage.map((s) => (
                          <NoPageTag key={s} source={s} />
                        ))}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[12.5px] text-ink-muted">ระดับความเสี่ยงตามเอกสาร</span>
                  {f.riskLevel ? (
                    <>
                      <RiskMeter level={f.riskLevel.value} />
                      {f.riskLevel.ref ? <SourceChip {...f.riskLevel.ref} className="self-start" /> : <NoPageTag source={f.riskLevel.source} />}
                    </>
                  ) : (
                    <span className="text-[13px] text-ink-muted">{NOT_IN_DOCS}</span>
                  )}
                </div>
              </div>

              {f.masterCostElsewhere && (
                <p className="m-0 rounded-xl bg-sun-soft px-3 py-2 text-[13.5px] font-semibold text-sun-ink"><Icon name="warn" className="mr-1" />{MASTER_COST_NOTE}</p>
              )}
              {f.hiddenInProspectus && (
                <p className="m-0 rounded-xl bg-sun-soft px-3 py-2 text-[13.5px] font-semibold text-sun-ink"><Icon name="warn" className="mr-1" />{MASTER_COST_NOTE}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-[14px] text-ink-body">
                <span className="text-ink-muted">ความเสี่ยงที่ควรรู้:</span>
                {f.alertCounts.high > 0 && <RiskBadge level="high" className="!font-semibold" />}
                {f.alertCounts.medium > 0 && <RiskBadge level="medium" />}
                {f.alertCounts.info > 0 && <RiskBadge level="info" />}
                <span>{f.alertCounts.high + f.alertCounts.medium + f.alertCounts.info} ข้อ</span>
              </div>

              <div className="mt-auto flex flex-wrap gap-2">
                <Link
                  href={`/funds/${encodeURIComponent(f.code)}`}
                  className="inline-flex min-h-[44px] items-center rounded-full bg-brand px-5 font-bold text-white no-underline hover:bg-brand-dark"
                >
                  ดูรายละเอียด
                </Link>
                <Link
                  href={`/calculator?funds=${encodeURIComponent(f.code)}`}
                  className="inline-flex min-h-[44px] items-center rounded-full border-2 border-brand px-5 font-bold text-brand no-underline hover:bg-brand-soft"
                >
                  คำนวณเป็นบาท
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { FundSummary } from "@/lib/fundSummary";
import { pct } from "@/lib/money";
import { refAnchor, type RefCardData } from "@/lib/referenceShared";

import { Icon } from "../Icon";
import { RefCard } from "../reference/RefCard";
import { SampleBadge } from "../SampleBadge";
import { DataStatusBadge } from "./DataStatusBadge";
import { IconRail, type RailItem } from "./IconRail";

export type BrowserCategory = { num: number; title: string };

/** Fund card: only the two numbers people compare at a glance; the whole card opens the fund's page. */
function FundCard({ f }: { f: FundSummary }) {
  const hiddenCost = f.masterCostElsewhere || f.hiddenInProspectus;
  return (
    <li className="group relative flex flex-col overflow-hidden rounded-[22px] border border-line bg-surface transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-[0_14px_30px_-18px_rgba(20,46,34,.45)]">
      <div className="flex flex-col gap-2 px-5 pb-4 pt-5">
        <span className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[12px] font-bold tracking-wide text-brand">
            {f.code}
          </span>
          <span className="flex items-center gap-1.5">
            {f.isSample && <SampleBadge />}
            {f.isFeeder && (
              <span className="text-[12px] text-ink-muted">Feeder Fund</span>
            )}
          </span>
        </span>
        <h3 className="m-0 line-clamp-2 min-h-[2.75em] text-[16.5px] font-bold leading-snug">
          {/* the link covers the whole card */}
          <Link
            href={`/funds/${encodeURIComponent(f.code)}`}
            className="text-ink no-underline after:absolute after:inset-0"
          >
            {f.nameTh}
          </Link>
        </h3>
        <span className="truncate text-[13px] text-ink-muted">
          {f.amc ?? " "}
        </span>
        {!f.isSample && f.status.kind !== "verified" && (
          <DataStatusBadge status={f.status} chipOnly />
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-line-subtle px-5 py-4">
        <div className="flex items-end justify-between gap-3">
          <span className="flex flex-col">
            <span className="text-[12px] text-ink-muted">ต้นทุนต่อปีรวม</span>
            {f.annualCostRate === null ? (
              <span className="text-[14px] text-ink-muted">ไม่พบในเอกสาร</span>
            ) : (
              <b className="text-[26px] leading-tight text-brand">
                {pct(f.annualCostRate)}
              </b>
            )}
          </span>
          <span className="flex flex-col items-end">
            <span className="text-[12px] text-ink-muted">ความเสี่ยง</span>
            {f.riskLevel ? (
              <b className="text-[20px] leading-tight text-ink">
                {f.riskLevel.value}
                <span className="text-[13px] font-medium text-ink-faint">
                  /8
                </span>
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
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </div>
    </li>
  );
}

/**
 * The "ดูทีละกอง" list: a row of round icons (IconRail) for funds and each reference group, all the
 * same size, then a search box for the chosen item and its cards. Order is the data order, never a
 * ranking. Topics nobody has checked yet are listed as short lines under the grid, not empty cards.
 */
export function FundBrowser({
  funds,
  refs,
  categories,
}: {
  funds: FundSummary[];
  refs: RefCardData[];
  categories: BrowserCategory[];
}) {
  const [q, setQ] = useState("");
  // "funds" or a group number as text
  const [sel, setSel] = useState("funds");
  const catTitle = useMemo(
    () => new Map(categories.map((c) => [c.num, c.title])),
    [categories],
  );
  const cat = sel === "funds" ? null : Number(sel);

  const { shownFunds, shownRefs, todo } = useMemo(() => {
    const s = q.trim().toLowerCase();
    const hit = (vals: (string | null | undefined)[]) =>
      !s || vals.some((v) => (v ?? "").toLowerCase().includes(s));
    const refHit = (r: RefCardData) =>
      r.cat === cat && hit([r.id, r.title, r.summary, r.headline?.label]);
    return {
      shownFunds:
        cat === null
          ? funds.filter((f) => hit([f.code, f.nameTh, f.amc, f.type]))
          : [],
      shownRefs: refs.filter((r) => r.status !== "unchecked" && refHit(r)),
      todo: refs.filter((r) => r.status === "unchecked" && refHit(r)),
    };
  }, [funds, refs, q, cat]);

  const total = shownFunds.length + shownRefs.length;
  const items: RailItem[] = useMemo(
    () => [
      { key: "funds", label: "กองทุน", count: funds.length },
      ...categories.map((c) => ({
        key: String(c.num),
        label: c.title,
        count: refs.filter((r) => r.cat === c.num && r.status !== "unchecked")
          .length,
      })),
    ],
    [funds, refs, categories],
  );
  const heading = cat === null ? "กองทุน" : (catTitle.get(cat) ?? "");

  return (
    <div className="flex flex-col gap-4">
      <IconRail
        label="เลือกหมวด"
        items={items}
        active={sel}
        onSelect={(k) => {
          setSel(k);
          setQ("");
        }}
      />

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-baseline gap-3">
            <h2 className="m-0 text-[21px] font-bold">{heading}</h2>
            <span className="text-[14px] text-ink-muted">{total} รายการ</span>
          </div>
          <label className="relative block sm:w-[360px]">
            <span className="sr-only">ค้นหาใน{heading}</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
              <Icon name="search" size={18} />
            </span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                cat === null
                  ? "ค้นหาชื่อกอง รหัสกอง หรือ บลจ."
                  : `ค้นหาใน${heading}`
              }
              className="min-h-[48px] w-full rounded-xl border border-line bg-surface pl-11 pr-4 text-[16px] text-ink placeholder:text-ink-faint focus:border-brand"
            />
          </label>
        </div>

        {total === 0 ? (
          <p className="m-0 rounded-2xl border border-line bg-surface p-6 text-ink-body">
            ไม่พบรายการที่ค้นหา ลองคำอื่นหรือเปลี่ยนหมวดดูนะคะ
          </p>
        ) : (
          <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
            {shownFunds.map((f) => (
              <FundCard key={f.code} f={f} />
            ))}
            {shownRefs.map((r) => (
              <RefCard key={r.id} item={r} />
            ))}
          </ul>
        )}

        {todo.length > 0 && (
          <div className="rounded-2xl border border-dashed border-line px-4 py-3">
            <p className="m-0 text-[14px] font-semibold text-ink-muted">
              หัวข้อที่ยังไม่ได้ตรวจสอบในรอบนี้ ({todo.length})
            </p>
            <ul className="m-0 mt-1.5 flex list-none flex-wrap gap-1.5 p-0">
              {todo.map((it) => (
                <li
                  key={it.id}
                  id={refAnchor(it.id)}
                  className="scroll-mt-48 rounded-full bg-brand-tint px-2.5 py-0.5 text-[13.5px] text-ink-body"
                >
                  <span className="text-ink-muted tabular-nums">{it.id}</span>{" "}
                  {it.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

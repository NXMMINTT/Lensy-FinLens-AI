"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { useTrendCatalog } from "@/hooks/market/useTrendCatalog";
import { loadPickedPlatforms, savePickedPlatforms } from "@/lib/market/pickedPlatforms";
import { platformLogo } from "@/lib/market/platformLogo";
import type { CatalogPlatform } from "@/types/market";
import { useLocale } from "@/lib/i18n";

const CATEGORIES = [
  { id: "all", label: "ทั้งหมด" },
  { id: "thai", label: "ในไทย" },
  { id: "intl", label: "ต่างประเทศ" },
] as const;
type CategoryId = (typeof CATEGORIES)[number]["id"];

const TH_ALIASES: [string, string][] = [
  ["shopee", "ช้อปปี้"],
  ["lazada", "ลาซาด้า"],
  ["tiktok", "ติ๊กต็อก"],
  ["line", "ไลน์"],
  ["facebook", "เฟซบุ๊ก"],
  ["instagram", "อินสตาแกรม"],
  ["amazon", "อเมซอน"],
  ["ebay", "อีเบย์"],
  ["aliexpress", "อาลีเอ็กซ์เพรส"],
  ["alibaba", "อาลีบาบา"],
  ["taobao", "เถาเป่า"],
  ["tmall", "ทีมอล"],
  ["kaidee", "ไดเด็"],
  ["grab", "แกร็บ"],
];
function matchesQuery(p: CatalogPlatform, q: string): boolean {
  const name = p.name.toLowerCase();
  const alias = TH_ALIASES.find(([en]) => name.includes(en))?.[1] ?? "";
  return name.includes(q) || (alias.length > 0 && alias.includes(q));
}

const POPULAR_IDS = ["shopee_th", "lazada_th", "tiktok_shop_th", "central_online", "kaidee"];

export default function PlatformsPage() {
  const th = useLocale();
  const catalog = useTrendCatalog();
  const [saved, setSaved] = useState<string[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId>("all");

  useEffect(() => setSaved(loadPickedPlatforms()), []);

  function update(next: string[]) {
    setSaved(next);
    savePickedPlatforms(next);
  }

  const toggle = (picked: string[], id: string) =>
    update(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);

  const platforms = catalog.data?.platforms ?? [];
  const picked = saved ?? platforms.map((p) => p.id);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return platforms.filter((p) => {
      if (category === "thai" && p.intl) return false;
      if (category === "intl" && !p.intl) return false;
      return q === "" || matchesQuery(p, q);
    });
  }, [platforms, category, query]);

  const pickedPlatforms = platforms.filter((p) => picked.includes(p.id));

  if (catalog.error)
    return <Card className="border-danger-line bg-danger-soft text-sm text-danger-ink">{catalog.error.message}</Card>;
  if (!catalog.data)
    return <Card className="text-center text-sm text-ink-muted">{th.myBusiness.loading}</Card>;

  return (
    <div className="flex flex-col gap-6 pb-32">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink md:text-2xl">เลือก Platform</h1>
          <p className="mt-1 text-sm text-ink-muted">เลือกช่องทางขายที่ต้องการวิเคราะห์ได้หลายรายการ</p>
        </div>
        <Link
          href="/market"
          className="mt-1 whitespace-nowrap rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-semibold text-brand no-underline hover:bg-brand hover:text-white"
        >
          Market Radar
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาแพลตฟอร์ม เช่น Shopee, TikTok Shop..."
          className="min-h-[48px] w-full rounded-xl border-2 border-line bg-surface pl-11 pr-10 text-[15px] text-ink-body outline-none focus:border-brand"
        />
        {query !== "" && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-faint hover:bg-line"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick select */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">เลือกแบบรวดเร็ว</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const popularIds = POPULAR_IDS.filter((id) => platforms.some((p) => p.id === id));
              update([...new Set([...picked, ...popularIds])]);
            }}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border-2 border-sun bg-sun-soft px-4 text-sm font-semibold text-sun-ink hover:bg-sun"
          >
            <span>⭐</span> ยอดนิยม
          </button>
          <button
            type="button"
            onClick={() => {
              const thaiIds = platforms.filter((p) => !p.intl).map((p) => p.id);
              update([...new Set([...picked, ...thaiIds])]);
            }}
            className="inline-flex min-h-[38px] items-center rounded-full border-2 border-line bg-surface px-4 text-sm font-semibold text-ink-body hover:border-brand hover:text-brand"
          >
            เลือกทั้งหมดในไทย
          </button>
          <button
            type="button"
            onClick={() => update(platforms.map((p) => p.id))}
            className="inline-flex min-h-[38px] items-center rounded-full border-2 border-line bg-surface px-4 text-sm font-semibold text-ink-body hover:border-brand hover:text-brand"
          >
            เลือกทั้งหมด
          </button>
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">หมวดหมู่แพลตฟอร์ม</p>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={`inline-flex min-h-[40px] flex-none items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors ${
                category === c.id
                  ? "bg-navy text-white"
                  : "border-2 border-line bg-surface text-ink-body hover:border-brand hover:text-brand"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <Card className="text-center text-sm text-ink-muted">
          ไม่พบแพลตฟอร์มที่ตรงกับคำค้นหา{" "}
          <button
            type="button"
            onClick={() => { setQuery(""); setCategory("all"); }}
            className="font-semibold text-brand hover:underline"
          >
            ล้างการค้นหา
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => {
            const on = picked.includes(p.id);
            const logo = platformLogo(p.id);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(picked, p.id)}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 px-3 pb-4 pt-5 text-center transition-all ${
                  on
                    ? "border-brand bg-brand-tint shadow-[0_6px_20px_rgba(26,118,55,0.12)]"
                    : "border-line bg-surface hover:border-brand-light"
                }`}
              >
                <span
                  className={`absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full text-xs ${
                    on ? "bg-brand text-white" : "border-2 border-line bg-surface text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  {on ? "✓" : ""}
                </span>

                <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-line bg-surface">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="h-full w-full object-contain p-1.5" />
                  ) : (
                    <span className="text-xl font-bold text-brand">{p.name.charAt(0).toUpperCase()}</span>
                  )}
                </span>

                <span className="text-sm font-semibold leading-tight text-ink">{p.name}</span>
                <span className="text-[11px] text-ink-faint">{p.intl ? "ทั่วโลก" : "ไทย"}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          {/* Left: avatar stack + count */}
          <div className="flex min-w-0 items-center gap-3">
            {pickedPlatforms.length > 0 && (
              <div className="flex flex-none items-center">
                {pickedPlatforms.slice(0, 5).map((p, i) => {
                  const logo = platformLogo(p.id);
                  return (
                    <span
                      key={p.id}
                      className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2 border-surface bg-surface shadow-sm"
                      style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 5 - i }}
                      title={p.name}
                    >
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} alt="" className="h-full w-full object-contain p-1" />
                      ) : (
                        <span className="text-xs font-bold text-brand">{p.name.charAt(0).toUpperCase()}</span>
                      )}
                    </span>
                  );
                })}
                {pickedPlatforms.length > 5 && (
                  <span
                    className="grid h-9 w-9 flex-none place-items-center rounded-full border-2 border-surface bg-brand-soft text-[11px] font-bold text-brand shadow-sm"
                    style={{ marginLeft: -10 }}
                  >
                    +{pickedPlatforms.length - 5}
                  </span>
                )}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {picked.length ? (
                  <>เลือกแล้ว <span className="text-brand">{picked.length}</span> แพลตฟอร์ม</>
                ) : (
                  "ยังไม่ได้เลือกแพลตฟอร์ม"
                )}
              </p>
              {picked.length > 0 && (
                <button
                  type="button"
                  onClick={() => update([])}
                  className="text-xs font-medium text-ink-muted hover:text-expense hover:underline"
                >
                  ล้างทั้งหมด
                </button>
              )}
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/market/trends"
            aria-disabled={!picked.length}
            className={`inline-flex min-h-[46px] flex-none items-center whitespace-nowrap rounded-xl px-5 text-sm font-semibold text-white no-underline ${
              picked.length ? "bg-brand hover:bg-brand-dark" : "pointer-events-none bg-[#94A3B8]"
            }`}
          >
            ดำเนินการต่อ ({picked.length}) →
          </Link>
        </div>
      </div>
    </div>
  );
}

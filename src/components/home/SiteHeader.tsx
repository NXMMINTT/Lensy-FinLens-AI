"use client";

import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { LineIcon } from "@/components/ui/LineIcon";
import { useI18n, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

const LOCALES: Locale[] = ["th", "en", "zh"];

function LangSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-line bg-surface px-3 text-[13px] font-semibold text-ink-body hover:border-brand"
      >
        <LineIcon name="globe" size={15} /> {LOCALE_LABELS[locale]}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-30 mt-1 flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => { setLocale(l); setOpen(false); }}
                className={`min-w-[120px] px-4 py-2.5 text-left text-[14px] font-medium hover:bg-brand-tint ${locale === l ? "bg-brand-soft text-brand font-bold" : "text-ink-body"}`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { resolved, setMode } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setMode(resolved === "light" ? "dark" : "light")}
      className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full border border-line bg-surface text-ink-body hover:border-brand"
      title={resolved === "light" ? "Dark mode" : "Light mode"}
    >
      <LineIcon name={resolved === "light" ? "moon" : "sun"} size={17} />
    </button>
  );
}

const NAV = [
  { href: "#ledger", labelKey: "site.ledger" },
  { href: "#tax", labelKey: "site.tax" },
  { href: "#radar", labelKey: "site.radar" },
  { href: "#pricing", labelKey: "site.pricing" },
  { href: "#faq", labelKey: "site.faq" },
];

const NAV_FALLBACK: Record<string, string> = {
  "site.ledger": "จดบัญชี",
  "site.tax": "ภาษี",
  "site.radar": "ส่องคู่แข่ง",
  "site.pricing": "ราคา",
  "site.faq": "ถามบ่อย",
};

export function SiteHeader() {
  const { tr } = useI18n();

  return (
    <header className="sticky top-0 z-20 bg-surface/95 shadow-[0_1px_0_#E6EEF9] backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Logo />
        <nav aria-label="main" className="hidden flex-wrap text-base lg:flex">
          {NAV.map((n) => {
            const label = tr(n.labelKey);
            return (
              <a key={n.href} href={n.href} className="inline-flex min-h-[44px] items-center px-3.5 font-medium text-ink-body no-underline hover:text-brand">
                {label === n.labelKey ? NAV_FALLBACK[n.labelKey] : label}
              </a>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <ThemeToggle />
          <Link href="/dashboard" className="inline-flex min-h-[44px] items-center rounded-full bg-brand px-6 font-bold text-white no-underline hover:bg-brand-dark">
            {tr("site.cta") === "site.cta" ? "เข้าใช้งาน" : tr("site.cta")}
          </Link>
        </div>
      </div>
    </header>
  );
}

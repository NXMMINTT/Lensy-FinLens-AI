"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { LineProfileBadge } from "@/components/LineProfileBadge";
import { LineIcon } from "@/components/ui/LineIcon";
import { useI18n, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

const TABS = [
  { href: "/dashboard", labelKey: "nav.myShop", matches: ["/dashboard", "/transactions", "/stock"], premium: false },
  { href: "/market", labelKey: "nav.marketRadar", matches: ["/market"], premium: true },
];

const LOCALES: Locale[] = ["th", "en", "zh"];

function useActiveTab() {
  const pathname = usePathname();
  return (tab: (typeof TABS)[number]) => tab.matches.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

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

  function toggle() {
    setMode(resolved === "light" ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full border border-line bg-surface text-ink-body hover:border-brand"
      title={resolved === "light" ? "Dark mode" : "Light mode"}
    >
      <LineIcon name={resolved === "light" ? "moon" : "sun"} size={17} />
    </button>
  );
}

export function SiteHeader() {
  const isActive = useActiveTab();
  const { tr } = useI18n();

  return (
    <header className="sticky top-0 z-10 bg-surface shadow-[0_2px_12px_rgba(26,111,214,.06)]">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Logo href="/dashboard" />
        <nav aria-label="main tabs" className="hidden gap-1.5 rounded-full bg-brand-soft p-1.5 md:flex">
          {TABS.map((tab) => {
            const active = isActive(tab);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 font-semibold no-underline ${
                  active ? "bg-brand text-white" : "text-ink-body hover:text-brand"
                }`}
              >
                {tr(tab.labelKey)}
                {tab.premium && <span className="rounded-full bg-sun px-2 py-0.5 text-xs font-bold text-[#4A3500]">Premium</span>}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <ThemeToggle />
          <LineProfileBadge />
          <Link href="/" className="text-[15px] font-medium text-ink-muted no-underline hover:text-brand">
            {tr("nav.home")}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function NavTabs() {
  const isActive = useActiveTab();
  const { tr } = useI18n();

  return (
    <nav aria-label="main tabs" className="fixed bottom-0 left-0 right-0 z-10 flex gap-2 border-t border-line bg-surface p-2 md:hidden">
      {TABS.map((tab) => {
        const active = isActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[48px] flex-1 items-center justify-center rounded-full text-[15px] font-semibold no-underline ${
              active ? "bg-brand text-white" : "text-ink-body"
            }`}
          >
            {tr(tab.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

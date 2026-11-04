"use client";

import Link from "next/link";

import { type FoxPose, UFox } from "@/components/brand/UFox";
import { ShopOverview } from "@/components/dashboard/ShopOverview";
import { useLocale } from "@/lib/i18n";

function MenuIcon({ type, className = "" }: { type: string; className?: string }) {
  const c = `w-8 h-8 ${className}`;
  switch (type) {
    case "income":
      return (
        <svg className={c} viewBox="0 0 32 32" fill="none">
          <rect x="6" y="8" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M12 16h8M16 12v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "expense":
      return (
        <svg className={c} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M16 11v10M13 14l3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "summary":
      return (
        <svg className={c} viewBox="0 0 32 32" fill="none">
          <rect x="8" y="14" width="4" height="10" rx="1" fill="currentColor" />
          <rect x="14" y="10" width="4" height="14" rx="1" fill="currentColor" />
          <rect x="20" y="6" width="4" height="18" rx="1" fill="currentColor" />
        </svg>
      );
    case "stock":
      return (
        <svg className={c} viewBox="0 0 32 32" fill="none">
          <rect x="7" y="6" width="18" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M12 12h8M12 16h8M12 20h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "market":
      return (
        <svg className={c} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M16 6a10 10 0 000 20M6 16h20M16 6c-3 3-3 17 0 20M16 6c3 3 3 17 0 20" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "premium":
      return (
        <svg className={c} viewBox="0 0 32 32" fill="none">
          <path d="M16 6l3 6 7 1-5 5 1.2 7L16 22l-6.2 3L11 18l-5-5 7-1z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );
    case "settings":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      );
    case "help":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round" />
        </svg>
      );
    case "chat":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          <path d="M8 10h.01M12 10h.01M16 10h.01" />
        </svg>
      );
    default:
      return null;
  }
}

export default function HomePage() {
  const th = useLocale();
  const h = th.home;

  const MENU_ITEMS: { href: string; fox: FoxPose; label: string; sub: string; badge?: string }[] = [
    { href: "/transactions?mode=income", fox: "cheer", label: h.recordIncome, sub: h.recordIncomeSub },
    { href: "/transactions?mode=expense", fox: "ledger", label: h.recordExpense, sub: h.recordExpenseSub },
    { href: "/dashboard/summary", fox: "idea", label: h.summaryOverview, sub: h.summaryOverviewSub },
    { href: "/stock", fox: "commerce", label: h.manageProducts, sub: h.manageProductsSub },
    { href: "/market", fox: "radar", label: h.viewMarket, sub: h.viewMarketSub, badge: h.new },
    { href: "/knowledge", fox: "idea", label: h.knowledge, sub: h.knowledgeSub, badge: h.new },
    { href: "/market/plans", fox: "proud", label: h.upgradePlan, sub: h.upgradePlanSub },
  ];

  const BOTTOM_LINKS = [
    { href: "/settings", icon: "settings", label: h.shopSettings },
    { href: "/help", icon: "help", label: h.howToUse },
    { href: "/chat", icon: "chat", label: h.chatWithUFox },
  ];

  return (
    <div className="flex flex-col gap-5 pb-4">
      <ShopOverview />

      <section className="grid grid-cols-3 gap-3">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-col items-center gap-2 rounded-[20px] bg-surface p-4 pt-5 text-center no-underline shadow-[0_2px_12px_rgba(0,0,0,0.06)] active:scale-[0.97] transition-transform"
          >
            {item.badge && (
              <span className="absolute -top-1.5 -right-1.5 rounded-full bg-expense-solid px-2 py-0.5 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            )}
            <UFox pose={item.fox} size={72} />
            <span className="text-[13px] font-bold text-ink leading-tight">{item.label}</span>
            <span className="text-[11px] text-ink-muted leading-tight whitespace-pre-line">{item.sub}</span>
          </Link>
        ))}
      </section>

      <section className="flex justify-center gap-6 py-2">
        {BOTTOM_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1.5 text-ink-muted no-underline"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-line-subtle">
              <MenuIcon type={item.icon} />
            </span>
            <span className="text-[12px] font-medium">{item.label}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

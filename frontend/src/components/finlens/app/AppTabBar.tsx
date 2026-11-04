"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/funds", label: "กองทุน", icon: "M4 19V9m6 10V5m6 14v-7m4 7H2" },
  { href: "/compare", label: "เปรียบเทียบ", icon: "M3 17l6-6 4 4 8-8M15 7h6v6" },
  { href: "/chat", label: "ถาม Lensy", icon: "M4 5h16v11H8l-4 4V5z" },
];

/** Bottom tab bar on phones (and inside LINE via LIFF). Hidden from md up, where the header has the links. */
export function AppTabBar() {
  const path = usePathname();
  return (
    <nav aria-label="เมนูแอป" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="m-0 grid list-none grid-cols-3 p-0">
        {TABS.map((t) => {
          const active = path === t.href || path.startsWith(`${t.href}/`);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[12px] font-semibold no-underline ${active ? "text-brand" : "text-ink-muted"}`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={t.icon} />
                </svg>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

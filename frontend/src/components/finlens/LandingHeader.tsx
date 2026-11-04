"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LineIcon } from "@/components/ui/LineIcon";
import { useTheme } from "@/lib/theme";

import { FinLensLogo } from "./Logo";

const NAV = [
  { href: "/funds", label: "กองทุน" },
  { href: "/compare", label: "เทียบต้นทุน" },
  { href: "/chat", label: "ถาม Lensy" },
  { href: "/#pricing", label: "ราคา" },
];

function ThemeToggle() {
  const { resolved, setMode } = useTheme();
  const dark = resolved === "dark";
  return (
    <button
      type="button"
      onClick={() => setMode(dark ? "light" : "dark")}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-line bg-surface text-ink-body hover:border-brand"
      aria-label={dark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
    >
      <LineIcon name={dark ? "sun" : "moon"} size={18} />
    </button>
  );
}

function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    // load the LINE SDK only when needed, so the promo page stays light
    const { liffLogout } = await import("@/lib/liff");
    liffLogout();
    window.location.assign("/");
  }
  return (
    <button
      type="button"
      onClick={logout}
      className="inline-flex min-h-[44px] items-center rounded-full border border-line bg-surface px-3.5 text-[14px] font-semibold text-ink-body hover:border-brand"
    >
      ออกจากระบบ
    </button>
  );
}

export function LandingHeader({ signedIn = false }: { signedIn?: boolean } = {}) {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-20 bg-surface/95 shadow-[0_1px_0_rgb(var(--line))] backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-2.5 md:px-6">
        <Link href="/" className="rounded-xl no-underline" aria-label="FinLens AI หน้าแรก">
          <FinLensLogo height={34} />
        </Link>
        <nav aria-label="เมนูหลัก" className="hidden text-base md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={path === n.href || path.startsWith(`${n.href}/`) ? "page" : undefined}
              className="inline-flex min-h-[44px] items-center px-3.5 font-medium text-ink-body aria-[current=page]:font-bold aria-[current=page]:text-brand no-underline hover:text-brand"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {signedIn && <LogoutButton />}
          <Link
            href="/chat"
            className={`${signedIn ? "hidden sm:inline-flex" : "inline-flex"} min-h-[44px] items-center rounded-full bg-brand px-5 font-bold text-white no-underline hover:bg-brand-dark`}
          >
            คุยกับ Lensy
          </Link>
        </div>
      </div>
    </header>
  );
}

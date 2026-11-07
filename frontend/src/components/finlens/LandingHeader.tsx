"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LineIcon } from "@/components/ui/LineIcon";
import { useTheme } from "@/lib/theme";

import { FinLensLogo } from "./Logo";

/** Promo page: jump to sections of the home page. */
const NAV_LANDING = [
  { href: "/#features", label: "ฟีเจอร์" },
  { href: "/#try", label: "ลองคำนวณ" },
  { href: "/#how", label: "วิธีใช้" },
  { href: "/#pricing", label: "ราคา" },
  { href: "/#faq", label: "ถามบ่อย" },
  { href: "/#glossary", label: "ความหมาย" },
];

/** Dashboard (signed in): the app pages. */
const NAV_APP = [
  { href: "/funds", label: "เมนู" },
  { href: "/compare", label: "เทียบกองทุน" },
  { href: "/explain", label: "ดูทีละกอง" },
  { href: "/calculator", label: "คำนวณเป็นบาท" },
  { href: "/chat", label: "ถาม Lensy" },
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
    // load the LINE SDK only when needed, so the promo page stays light
    const { signOut } = await import("@/lib/liff");
    await signOut(); // our session cookie and LINE (liff.logout)
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
    // floating capsule: the bar sits off the page edge, rounded, with a soft shadow
    <header className="pointer-events-none sticky top-0 z-20 px-3 pt-3 md:px-6">
      <div className="pointer-events-auto mx-auto flex max-w-[1120px] items-center justify-between gap-2 rounded-full border border-line bg-surface/90 py-1.5 pl-3 pr-1.5 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.25)] backdrop-blur md:pl-4">
        <Link href="/" className="shrink-0 rounded-full no-underline" aria-label="FinLens AI หน้าแรก">
          <FinLensLogo height={32} />
        </Link>
        <nav aria-label="เมนูหลัก" className="hidden items-center gap-0.5 text-[15px] md:flex">
          {(signedIn ? NAV_APP : NAV_LANDING).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={signedIn && (path === n.href || path.startsWith(`${n.href}/`)) ? "page" : undefined}
              className="inline-flex min-h-[40px] items-center whitespace-nowrap rounded-full px-3.5 font-medium text-ink-body no-underline hover:bg-brand-soft hover:text-brand aria-[current=page]:bg-brand-soft aria-[current=page]:font-bold aria-[current=page]:text-brand"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          {signedIn && <LogoutButton />}
          <Link
            href={signedIn ? "/chat" : "/funds"}
            className={`${signedIn ? "hidden sm:inline-flex" : "inline-flex"} min-h-[44px] items-center rounded-full bg-brand px-5 font-bold text-white no-underline hover:bg-brand-dark`}
          >
            {signedIn ? "คุยกับ Lensy" : "เข้าใช้งาน"}
          </Link>
        </div>
      </div>
    </header>
  );
}

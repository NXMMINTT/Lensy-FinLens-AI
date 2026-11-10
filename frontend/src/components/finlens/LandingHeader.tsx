"use client";

import {
  BookOpen,
  Calculator,
  CircleHelp,
  GitCompareArrows,
  LayoutGrid,
  ListChecks,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Search,
  Sparkles,
  Sun,
  Tag,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LINE_ADD_FRIEND_URL } from "@/components/brand/LineAddFriendButton";
import { LineIcon } from "@/components/ui/LineIcon";
import { useTheme } from "@/lib/theme";

import { LensyFace } from "./Lensy";
import { FinLensLogo } from "./Logo";

type NavItem = { href: string; label: string; icon: LucideIcon };

/** Promo page: jump to sections of the home page. */
const NAV_LANDING: NavItem[] = [
  { href: "/#features", label: "ฟีเจอร์", icon: Sparkles },
  { href: "/#try", label: "ลองคำนวณ", icon: Calculator },
  { href: "/#how", label: "วิธีใช้", icon: ListChecks },
  { href: "/#pricing", label: "ราคา", icon: Tag },
  { href: "/#faq", label: "ถามบ่อย", icon: CircleHelp },
  { href: "/#glossary", label: "ความหมาย", icon: BookOpen },
];

/** Dashboard (signed in): the app pages. */
const NAV_APP: NavItem[] = [
  { href: "/funds", label: "เมนู", icon: LayoutGrid },
  { href: "/compare", label: "เทียบกองทุน", icon: GitCompareArrows },
  { href: "/explain", label: "ดูทีละกอง", icon: Search },
  { href: "/calculator", label: "คำนวณเป็นบาท", icon: Calculator },
  { href: "/chat", label: "ถาม Lensy", icon: MessageCircle },
];

function ThemeToggle({ display = "inline-flex" }: { display?: string }) {
  const { resolved, setMode } = useTheme();
  const dark = resolved === "dark";
  return (
    <button
      type="button"
      onClick={() => setMode(dark ? "light" : "dark")}
      className={`${display} min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-line bg-surface text-ink-body hover:border-brand`}
      aria-label={dark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
    >
      <LineIcon name={dark ? "sun" : "moon"} size={18} />
    </button>
  );
}

async function logout() {
  // load the LINE SDK only when needed, so the promo page stays light
  const { signOut } = await import("@/lib/liff");
  await signOut(); // our session cookie and LINE (liff.logout)
  window.location.assign("/");
}

/** Light / dark as two halves of one switch, for the phone menu. */
function ThemeSwitch() {
  const { resolved, setMode } = useTheme();
  const half = (mode: "light" | "dark", Icon: LucideIcon, label: string) => {
    const on = resolved === mode;
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => setMode(mode)}
        className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl text-[14px] font-semibold transition ${
          on
            ? "bg-surface text-brand shadow-[0_4px_12px_-6px_rgba(20,46,34,.4)]"
            : "text-ink-muted hover:text-ink"
        }`}
      >
        <Icon size={17} />
        {label}
      </button>
    );
  };
  return (
    <div
      role="group"
      aria-label="ธีม"
      className="flex gap-1 rounded-2xl bg-brand-tint p-1"
    >
      {half("light", Sun, "สว่าง")}
      {half("dark", Moon, "มืด")}
    </div>
  );
}

/**
 * The phone menu: a full screen with the brand, a greeting, the main page as one big
 * button, the other pages as icon tiles, the theme switch, and sign in / sign out at the bottom.
 */
function MobileMenu({
  nav,
  signedIn,
  current,
  onClose,
}: {
  nav: NavItem[];
  signedIn: boolean;
  current: (href: string) => "page" | undefined;
  onClose: () => void;
}) {
  const [main, ...rest] = signedIn ? nav : [];
  const tiles = signedIn ? rest : nav;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[60] md:hidden">
      <nav
        id="mobile-nav"
        aria-label="เมนูหลัก"
        className="absolute inset-0 flex flex-col gap-4 overflow-y-auto bg-surface px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]"
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={onClose}
            className="rounded-full no-underline"
            aria-label="FinLens AI หน้าแรก"
          >
            <FinLensLogo height={30} />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-tint text-ink-body hover:bg-brand-soft"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-brand-tint p-3">
          <span className="rounded-full p-0.5 ring-2 ring-brand/60">
            <LensyFace size={48} />
          </span>
          <span className="flex min-w-0 flex-col">
            <b className="text-[16px] text-ink">
              {signedIn ? "สวัสดีค่ะ" : "ยินดีต้อนรับค่ะ"}
            </b>
            <span className="text-[13px] text-ink-muted">
              {signedIn
                ? "เข้าสู่ระบบแล้ว · น้อง Lensy พร้อมช่วย"
                : "เข้าใช้งานด้วยบัญชี LINE ได้เลย"}
            </span>
          </span>
        </div>

        {main && (
          <Link
            href={main.href}
            onClick={onClose}
            aria-current={current(main.href)}
            className="flex min-h-[56px] items-center justify-center gap-2.5 rounded-2xl bg-brand text-[17px] font-bold text-white no-underline hover:bg-brand-dark"
          >
            <main.icon size={20} />
            {main.label}
          </Link>
        )}

        <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0">
          {tiles.map((n) => {
            const on = current(n.href) === "page";
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={onClose}
                  aria-current={on ? "page" : undefined}
                  className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border text-center text-[15px] font-semibold no-underline transition ${
                    on
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-line bg-surface text-ink-body hover:border-brand/50 hover:bg-brand-tint"
                  }`}
                >
                  <n.icon size={24} className="text-brand" />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* theme and sign in / out sit at the bottom of the screen */}
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <ThemeSwitch />
          <Link href="/privacy" onClick={onClose} className="self-center text-[14px] font-semibold text-ink-muted no-underline hover:text-brand">
            ความเป็นส่วนตัว
          </Link>

          {signedIn ? (
            <button
              type="button"
              onClick={logout}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-danger-line bg-danger-soft text-[16px] font-bold text-danger-ink hover:brightness-95"
            >
              <LogOut size={19} />
              ออกจากระบบ
            </button>
          ) : (
            <Link
              href="/funds"
              onClick={onClose}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-brand text-[16px] font-bold text-white no-underline hover:bg-brand-dark"
            >
              <LogIn size={19} />
              เข้าใช้งาน
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

export function LandingHeader({
  signedIn = false,
  inApp = false,
}: { signedIn?: boolean; inApp?: boolean } = {}) {
  const path = usePathname();
  // inside the app the menu lists the app's pages, whether or not the visitor has signed in
  const nav = signedIn || inApp ? NAV_APP : NAV_LANDING;
  // phones: the links open as a menu card over the page
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", key);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
    };
  }, [open]);
  const current = (href: string) =>
    signedIn && (path === href || path.startsWith(`${href}/`))
      ? "page"
      : undefined;

  return (
    // floating capsule: the bar sits off the page edge, rounded, with a soft shadow
    <header
      className={`pointer-events-none sticky top-0 ${open ? "z-[60]" : "z-20"} px-3 pt-3 md:px-6`}
    >
      <div className="pointer-events-auto mx-auto flex max-w-[1120px] items-center justify-between gap-2 rounded-full border border-line bg-surface/90 py-1.5 pl-3 pr-1.5 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.25)] backdrop-blur md:pl-4">
        <Link
          href="/"
          className="shrink-0 rounded-full no-underline"
          aria-label="FinLens AI หน้าแรก"
        >
          <FinLensLogo height={32} />
        </Link>
        <nav
          aria-label="เมนูหลัก"
          className="hidden items-center gap-0.5 text-[15px] md:flex"
        >
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={current(n.href)}
              className="inline-flex min-h-[40px] items-center whitespace-nowrap rounded-full px-3.5 font-medium text-ink-body no-underline hover:bg-brand-soft hover:text-brand aria-[current=page]:bg-brand-soft aria-[current=page]:font-bold aria-[current=page]:text-brand"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle display="hidden md:inline-flex" />
          {signedIn && (
            <button
              type="button"
              onClick={logout}
              className="hidden min-h-[44px] items-center rounded-full border border-line bg-surface px-3.5 text-[14px] font-semibold text-ink-body hover:border-brand md:inline-flex"
            >
              ออกจากระบบ
            </button>
          )}
          {/* phones: no button in the header (the ☰ menu has the way in), so the bar stays uncluttered */}
          {signedIn ? (
            // signed in: straight to น้อง Lensy's LINE account (add friend), in a new tab
            <a
              href={LINE_ADD_FRIEND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-[44px] items-center gap-2 rounded-full bg-brand px-5 font-bold text-white no-underline hover:bg-brand-dark sm:inline-flex"
            >
              คุยกับ Lensy
            </a>
          ) : (
            <Link
              href="/funds"
              className="hidden min-h-[44px] items-center rounded-full bg-brand px-5 font-bold text-white no-underline hover:bg-brand-dark sm:inline-flex"
            >
              เข้าใช้งาน
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="เปิดเมนู"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-line bg-surface text-ink-body hover:border-brand md:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
      {open && (
        <MobileMenu
          nav={nav}
          signedIn={signedIn}
          current={current}
          onClose={() => setOpen(false)}
        />
      )}
    </header>
  );
}

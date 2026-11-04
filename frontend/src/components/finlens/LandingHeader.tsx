"use client";

import Link from "next/link";

import { LINE_ADD_FRIEND_URL } from "@/components/brand/LineAddFriendButton";
import { LineIcon } from "@/components/ui/LineIcon";
import { useTheme } from "@/lib/theme";

import { FinLensLogo } from "./Logo";

const NAV = [
  { href: "#features", label: "ฟีเจอร์" },
  { href: "#how", label: "วิธีใช้" },
  { href: "#pricing", label: "ราคา" },
  { href: "#faq", label: "คำถามที่พบบ่อย" },
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

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 bg-surface/95 shadow-[0_1px_0_rgb(var(--line))] backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-2.5 md:px-6">
        <Link href="/" className="no-underline" aria-label="FinLens AI หน้าแรก">
          <FinLensLogo height={34} />
        </Link>
        <nav aria-label="เมนูหลัก" className="hidden text-base md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="inline-flex min-h-[44px] items-center px-3.5 font-medium text-ink-body no-underline hover:text-brand">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href={LINE_ADD_FRIEND_URL}
            className="inline-flex min-h-[44px] items-center rounded-full bg-brand px-5 font-bold text-white no-underline hover:bg-brand-dark"
          >
            คุยกับ Lensy
          </a>
        </div>
      </div>
    </header>
  );
}

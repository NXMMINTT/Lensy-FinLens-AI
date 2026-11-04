"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { UFox } from "@/components/brand/UFox";
import { Note } from "@/components/decor/Note";
import { useSubscription } from "@/hooks/market/useSubscription";

const SUB_NAV = [
  { href: "/market", label: "ภาพรวม" },
  { href: "/market/trends", label: "เทรนด์ตลาด", also: "/market/products/" },
  { href: "/market/compare", label: "เทียบราคา" },
  { href: "/market/chat", label: "ถาม U-Fox" },
  { href: "/market/sponsors", label: "ผู้สนับสนุน" },
  { href: "/market/platforms", label: "เลือกแพลตฟอร์ม" },
  { href: "/market/plans", label: "แพ็กเกจ" },
];

/** Tab 2 shell: sub-menu, trial badge, and the Premium lock
 * (mock-data/README.md: `is_premium` decides whether Tab 2 is locked). */
export default function MarketLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const subscription = useSubscription();
  const user = subscription.data?.current_user;
  const locked = user !== undefined && !user.is_premium && pathname !== "/market/plans";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Note className="text-base" tilt={-2}>
            ส่องตลาดแบบเนียนๆ
          </Note>
          <h1 className="m-0 text-3xl font-extrabold md:text-[34px]">Market Radar</h1>
        </div>
        {user?.status === "trialing" && user.days_left_in_trial !== null && (
          <Link href="/market/plans" className="rotate-2 rounded-xl bg-sun px-4 py-1.5 font-hand font-bold text-[#4A3500] no-underline shadow-md">
            ทดลองใช้เหลือ {user.days_left_in_trial} วัน
          </Link>
        )}
      </div>

      <nav aria-label="เมนู Market Radar" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {SUB_NAV.map((item) => {
          const active = pathname === item.href || (item.also !== undefined && pathname.startsWith(item.also));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-[44px] flex-none items-center whitespace-nowrap rounded-full px-5 text-[15px] font-semibold no-underline ${
                active ? "bg-navy text-white" : "border-2 border-sky-line bg-surface text-ink hover:border-brand hover:text-brand"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {locked ? (
        <section className="flex flex-col items-center gap-4 rounded-[32px] bg-surface p-10 text-center">
          <UFox size={110} wave mood="wink" />
          <h2 className="m-0 text-3xl font-bold">Market Radar สำหรับสมาชิก Premium</h2>
          <p className="m-0 max-w-xl text-ink-body">ดูราคาคู่แข่งทุกแพลตฟอร์มเทียบกับต้นทุนจริงของร้าน และให้ U-Fox แนะนำราคาขาย</p>
          <Link href="/market/plans" className="inline-flex min-h-[50px] items-center rounded-full bg-sun px-7 font-bold text-[#4A3500] no-underline">
            ทดลองฟรี 7 วัน
          </Link>
        </section>
      ) : (
        children
      )}

      <p className="m-0 text-sm text-ink-muted">ข้อมูลตลาดในแท็บนี้เป็นข้อมูลตัวอย่างสำหรับเดโม</p>
    </div>
  );
}

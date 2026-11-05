import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginPanel } from "@/components/finlens/app/LoginPanel";
import { MascotDecor } from "@/components/finlens/Decor";
import { Lensy, type LensyPose } from "@/components/finlens/Lensy";
import { FinLensLogo } from "@/components/finlens/Logo";
import { demoLoginAllowed, safeNext, SESSION_COOKIE, verifySession } from "@/lib/session";

export const metadata: Metadata = { title: "เข้าสู่ระบบ | FinLens AI" };

/** What the user gets after logging in (the main menu tiles). */
const PERKS: { pose: LensyPose; title: string; text: string }[] = [
  { pose: "magnifier", title: "เทียบกองทุน", text: "ค่าธรรมเนียมแฝงของ 2–3 กองเคียงกัน" },
  { pose: "coins", title: "คำนวณเป็นบาท", text: "ค่าธรรมเนียมกินเงินไปเท่าไหร่" },
  { pose: "idea", title: "ถามน้อง Lensy", text: "ศัพท์การเงิน ถามได้เลย" },
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await verifySession((await cookies()).get(SESSION_COOKIE)?.value)) redirect(next);

  return (
    <div className="bg-dots flex min-h-svh items-center justify-center bg-brand-tint px-4 py-8 text-ink md:py-12">
      <div className="grid w-full max-w-[960px] overflow-hidden rounded-[32px] border border-line bg-surface shadow-[0_24px_60px_rgba(20,46,34,.12)] md:grid-cols-[1.05fr_1fr]">
        {/* brand side */}
        <section
          aria-label="FinLens AI ทำอะไรได้บ้าง"
          className="force-light relative flex flex-col gap-5 overflow-hidden bg-gradient-to-br from-brand to-brand-dark px-6 py-7 text-white md:gap-7 md:px-9 md:py-10"
        >
          <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-4">
            <span className="relative shrink-0">
              <Lensy pose="wave" size={112} className="max-md:!h-[84px] max-md:!w-[84px]" />
              <MascotDecor light />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold text-white/80">ผู้ช่วยเทียบกองทุนรวม</span>
              <p className="m-0 font-heading text-[26px] font-bold leading-tight md:text-[32px]">
                เทียบกองทุนเคียงกัน
                <br />
                เห็นค่าธรรมเนียมแฝง
              </p>
            </div>
          </div>

          <ul className="relative m-0 flex list-none flex-col gap-2.5 p-0 max-md:hidden">
            {PERKS.map((p) => (
              <li key={p.title} className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white">
                  <Lensy pose={p.pose} size={42} />
                </span>
                <span className="flex flex-col leading-snug">
                  <b className="text-[16px]">{p.title}</b>
                  <span className="text-[14px] text-white/85">{p.text}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="relative m-0 mt-auto text-[13.5px] text-white/80 max-md:hidden">ทุกตัวเลขของกองมีเลขหน้าในเอกสาร เปิดตรวจเองได้</p>
        </section>

        {/* login side */}
        <section aria-labelledby="login-title" className="flex flex-col gap-6 px-6 py-8 md:px-10 md:py-10">
          <Link href="/" aria-label="FinLens AI หน้าแรก" className="self-start no-underline">
            <FinLensLogo height={30} />
          </Link>
          <LoginPanel next={next} demoAllowed={demoLoginAllowed()} />
          <Link href="/" className="mt-auto self-start text-[14.5px] text-ink-muted no-underline hover:text-brand">
            ← กลับหน้าแรก
          </Link>
        </section>
      </div>
    </div>
  );
}

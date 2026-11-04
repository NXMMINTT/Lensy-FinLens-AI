import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginPanel } from "@/components/finlens/app/LoginPanel";
import { FinLensLogo } from "@/components/finlens/Logo";
import { demoLoginAllowed, safeNext, SESSION_COOKIE, verifySession } from "@/lib/session";

export const metadata: Metadata = { title: "เข้าสู่ระบบ | FinLens AI" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await verifySession((await cookies()).get(SESSION_COOKIE)?.value)) redirect(next);

  return (
    <div className="bg-dots flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-10 text-ink">
      <Link href="/" aria-label="FinLens AI หน้าแรก" className="no-underline">
        <FinLensLogo height={38} />
      </Link>
      <LoginPanel next={next} demoAllowed={demoLoginAllowed()} />
      <Link href="/" className="text-[15px] text-ink-muted underline-offset-4 hover:text-brand hover:underline">
        ← กลับหน้าแรก
      </Link>
    </div>
  );
}

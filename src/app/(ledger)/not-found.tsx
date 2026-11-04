import Link from "next/link";

import { UFox } from "@/components/brand/UFox";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-[calc(100svh-150px)] items-center justify-center overflow-hidden py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(255,200,61,.2),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(26,118,55,.12),transparent_32%)]" />
      <div className="relative grid w-full max-w-[820px] items-center gap-8 overflow-hidden rounded-[32px] border-2 border-sky-line bg-surface px-6 py-8 shadow-[0_18px_50px_rgba(20,46,34,.12)] md:grid-cols-[.9fr_1.1fr] md:px-12 md:py-10">
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-40 w-40 rounded-full border-[18px] border-sun-soft" />
        <div className="relative flex justify-center md:justify-start">
          <div className="absolute bottom-2 h-5 w-36 rounded-[50%] bg-sky-deep blur-sm" />
          <UFox pose="question" size={230} className="relative drop-shadow-[0_14px_8px_rgba(20,46,34,.14)]" />
        </div>

        <section className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
          <span className="rounded-full bg-sun px-4 py-1 text-[13px] font-bold text-[#4A3500]">กำลังพัฒนา</span>
          <div>
            <p className="m-0 font-hand text-lg font-bold text-brand">U-Fox กำลังประกอบหน้านี้อยู่ค่ะ</p>
            <h1 className="m-0 mt-1 text-[30px] font-extrabold leading-tight text-ink md:text-[38px]">หน้านี้ยังไม่พร้อมใช้งาน</h1>
          </div>
          <p className="m-0 max-w-[430px] text-[16px] leading-relaxed text-ink-body">
            ฟีเจอร์นี้กำลังอยู่ระหว่างพัฒนา ตอนนี้กลับไปดูภาพรวมร้าน หรือเลือกเครื่องมือที่พร้อมใช้งานก่อนได้เลยนะคะ
          </p>
          <div className="flex w-full flex-wrap justify-center gap-3 md:justify-start">
            <Link href="/dashboard" className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand px-6 font-bold text-white no-underline shadow-[0_8px_18px_rgba(26,118,55,.2)] hover:bg-brand-dark">
              กลับหน้าร้านของฉัน
            </Link>
            <Link href="/help" className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-sky-line bg-surface px-6 font-bold text-brand no-underline hover:border-brand">
              ดูวิธีใช้งาน
            </Link>
          </div>
          <span className="text-[13px] text-ink-muted">รหัสหน้า 404 · FinLens AI</span>
        </section>
      </div>
    </main>
  );
}

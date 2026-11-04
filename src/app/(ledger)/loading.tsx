"use client";

import { useEffect, useState } from "react";

import { UFox } from "@/components/brand/UFox";

export default function Loading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => (value >= 100 ? 100 : value + 1));
    }, 80);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="relative flex min-h-[calc(100svh-150px)] items-center justify-center overflow-hidden py-8" aria-busy="true" aria-live="polite">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,200,61,.2),transparent_26%),radial-gradient(circle_at_50%_85%,rgba(26,118,55,.12),transparent_34%)]" />
      <section className="relative flex w-full max-w-[520px] flex-col items-center gap-5 rounded-[32px] border-2 border-sky-line bg-surface px-6 py-9 text-center shadow-[0_18px_50px_rgba(20,46,34,.12)] md:px-12">
        <span aria-hidden="true" className="absolute -right-8 -top-8 h-20 w-20 rounded-full border-[12px] border-sun-soft" />
        <div className="relative">
          <div aria-hidden="true" className="absolute bottom-1 left-1/2 h-4 w-32 -translate-x-1/2 rounded-[50%] bg-sky-deep blur-sm" />
          <UFox pose="happy" size={190} className="relative animate-pulse drop-shadow-[0_14px_8px_rgba(20,46,34,.14)]" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="m-0 font-hand text-lg font-bold text-brand">U-Fox กำลังเตรียมข้อมูลให้ค่ะ</p>
          <h1 className="m-0 text-[25px] font-extrabold leading-tight text-ink">กำลังดาวน์โหลดข้อมูล...</h1>
          <p className="m-0 mt-1 text-[15px] text-ink-muted">อีกนิดเดียวก็พร้อมใช้งานแล้วนะคะ</p>
        </div>
        <div
          className="w-full max-w-[360px]"
          role="progressbar"
          aria-label="กำลังดาวน์โหลด"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={`${progress}%`}
        >
          <div className="h-5 overflow-hidden rounded-full border-2 border-sky-line bg-brand-tint p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#54D110] via-brand to-[#0F3D2A] transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[12px] font-semibold text-ink-muted">
            <span>กำลังเตรียมข้อมูล</span>
            <span>{progress}%</span>
          </div>
        </div>
      </section>
    </main>
  );
}
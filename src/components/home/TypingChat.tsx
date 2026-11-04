"use client";

import { useEffect, useRef, useState } from "react";

import { UFoxFace } from "@/components/brand/UFoxFace";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

/** U-Fox asks, the seller answers — typed out when scrolled into view (instant without JS or with reduced motion). */
export function TypingChat({ bot, user }: { bot: string; user: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(3); // 0 hidden, 1 typing, 2 bot, 3 bot + user
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen: leave it shown
    setStep(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setStep(1);
        timers.push(setTimeout(() => setStep(2), 1100), setTimeout(() => setStep(3), 1900));
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div ref={ref} className="flex min-h-[124px] flex-col items-center gap-2.5 px-6 pb-14">
      <div className={`flex items-end gap-2.5 ${step === 0 ? "invisible" : ""}`}>
        <UFoxFace />
        {step === 1 ? (
          <span className="flex gap-1.5 rounded-[20px] rounded-bl-md bg-surface px-5 py-4 shadow-[0_4px_14px_rgba(26,111,214,.08)]" aria-label="U-Fox กำลังพิมพ์">
            {[0, 150, 300].map((d) => (
              <span key={d} className="h-2 w-2 animate-typing rounded-full bg-brand-light" style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
        ) : (
          <span className={`rounded-[20px] rounded-bl-md bg-surface px-[18px] py-2.5 shadow-[0_4px_14px_rgba(26,111,214,.08)] ${step === 2 ? "animate-pop" : ""}`}>{bot}</span>
        )}
      </div>
      <span className={`ml-28 rounded-[20px] rounded-br-md bg-chat px-[18px] py-2.5 text-[#0F2A12] ${step < 3 ? "invisible" : "animate-pop"}`}>{user}</span>
    </div>
  );
}

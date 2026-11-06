"use client";

import { useEffect, useRef, useState } from "react";

import { LensyFace } from "../Lensy";

/**
 * A small chat between sections: น้อง Lensy asks, the visitor answers. Typed out when it scrolls
 * into view; shown at once without JS, with reduced motion, or when it is already on screen.
 */
export function TypingChat({ bot, user, className = "" }: { bot: string; user: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(3); // 0 hidden, 1 typing, 2 bot, 3 bot + user

  useEffect(() => {
    const el = ref.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduced || !("IntersectionObserver" in window)) return;
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
    <div ref={ref} className={`flex min-h-[132px] flex-col items-center gap-2.5 px-5 py-10 text-[16px] md:text-[17px] ${className}`}>
      <div className={`flex max-w-full items-end gap-2.5 ${step === 0 ? "invisible" : ""}`}>
        <LensyFace size={44} />
        {step === 1 ? (
          <span className="flex gap-1.5 rounded-[20px] rounded-bl-md bg-surface px-5 py-4 shadow-[0_4px_14px_rgba(20,46,34,.08)]" aria-label="น้อง Lensy กำลังพิมพ์">
            {[0, 150, 300].map((d) => (
              <span key={d} className="h-2 w-2 animate-typing rounded-full bg-brand-light" style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
        ) : (
          <span className={`rounded-[20px] rounded-bl-md bg-surface px-[18px] py-2.5 shadow-[0_4px_14px_rgba(20,46,34,.08)] ${step === 2 ? "animate-pop" : ""}`}>{bot}</span>
        )}
      </div>
      <span className={`ml-20 rounded-[20px] rounded-br-md bg-chat px-[18px] py-2.5 text-[#0F2A12] md:ml-28 ${step < 3 ? "invisible" : "animate-pop"}`}>{user}</span>
    </div>
  );
}

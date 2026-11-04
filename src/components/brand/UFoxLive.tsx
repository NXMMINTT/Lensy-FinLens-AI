"use client";

import { useEffect, useRef, useState } from "react";

import { type FoxPose, UFox, type UFoxMood } from "@/components/brand/UFox";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

const DEFAULT_TIPS = [
  "ส่งสลิปมาได้เลย เดี๋ยวหนูจดให้ค่ะ",
  "พิมพ์ “สรุป” แล้วหนูบอกกำไรวันนี้ให้",
  "เก็บใบเสร็จค่าของไว้นะคะ หักภาษีได้",
  "คู่แข่งขึ้นราคาเมื่อไหร่ หนูจะแอบบอก",
  "อัดเสียงก็ได้ ไม่ต้องพิมพ์ให้เมื่อยมือ",
  "อย่าลืมกินข้าวนะคะ ร้านจะได้ไปต่อ",
];

/** U-Fox (U-Fox) that leans toward the pointer; clicking makes it cheer and say a tip. */
export function UFoxLive({
  size = 140,
  mood = "happy",
  pose,
  wave = false,
  tips = DEFAULT_TIPS,
  className = "",
  bubbleSide = "left",
}: {
  size?: number;
  mood?: UFoxMood;
  pose?: FoxPose;
  wave?: boolean;
  tips?: readonly string[];
  className?: string;
  bubbleSide?: "left" | "right";
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [tip, setTip] = useState<{ text: string; n: number } | null>(null);
  const [wink, setWink] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onMove = (e: PointerEvent) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      const dx = e.clientX - (box.left + box.width / 2);
      const dy = e.clientY - (box.top + box.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, dist / 300);
      setLook({ x: (dx / dist) * k, y: (dy / dist) * k });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    if (!tip) return;
    const t = setTimeout(() => setTip(null), 4000);
    return () => clearTimeout(t);
  }, [tip]);

  const say = () => {
    setTip((prev) => {
      const pool = tips.filter((t) => t !== prev?.text);
      return { text: pool[Math.floor(Math.random() * pool.length)], n: (prev?.n ?? 0) + 1 };
    });
    setWink(true);
    setTimeout(() => setWink(false), 600);
  };

  return (
    <span className={`relative inline-block ${className}`}>
      <button
        ref={ref}
        type="button"
        onClick={say}
        aria-label="กดคุยกับ U-Fox"
        className="block cursor-pointer rounded-full border-0 bg-transparent p-0 transition-transform hover:-rotate-6 active:scale-95"
      >
        <UFox size={size} mood={mood} pose={wink ? "cheer" : pose} wave={wave} look={look} />
      </button>
      <span aria-live="polite" className={`pointer-events-none absolute -top-4 z-[2] w-max max-w-[220px] ${bubbleSide === "left" ? "right-[85%]" : "left-[85%]"}`}>
        {tip && (
          <span
            key={tip.n}
            className={`block animate-pop rounded-2xl bg-surface px-4 py-2.5 font-hand text-[15px] font-semibold leading-snug text-ink shadow-[0_10px_24px_rgba(20,46,34,.16)] ${
              bubbleSide === "left" ? "rounded-br-sm" : "rounded-bl-sm"
            }`}
          >
            {tip.text}
          </span>
        )}
      </span>
    </span>
  );
}

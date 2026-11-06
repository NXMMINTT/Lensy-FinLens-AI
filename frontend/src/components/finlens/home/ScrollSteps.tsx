"use client";

import { useEffect, useRef, useState } from "react";

const DESKTOP = "(min-width: 1024px)";

/**
 * Feature card (heading + numbered steps) next to a phone that shows each step. On desktop the row
 * stays pinned while the page scrolls past, and each stretch of scrolling moves to the next step,
 * sliding the matching screen up. On smaller screens the steps are tappable.
 */
export function ScrollSteps({
  head,
  steps,
  visuals,
  decor,
  backdrop,
}: {
  head: React.ReactNode;
  steps: [string, string][];
  /** one screen per step */
  visuals: React.ReactNode[];
  /** stays put beside the screens (the mascot) */
  decor?: React.ReactNode;
  /** decoration behind the whole pinned row (fills the empty space on wide screens) */
  backdrop?: React.ReactNode;
}) {
  const [current, setCurrent] = useState(0);
  const outer = useRef<HTMLDivElement>(null);

  // progress through the tall wrapper → step index
  useEffect(() => {
    const onScroll = () => {
      const el = outer.current;
      if (!el || !window.matchMedia(DESKTOP).matches) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      setCurrent(Math.min(steps.length - 1, Math.floor(p * steps.length)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [steps.length]);

  const pick = (i: number) => {
    const el = outer.current;
    if (el && window.matchMedia(DESKTOP).matches) {
      // scroll to the middle of that step's stretch; the scroll handler does the rest
      const total = el.offsetHeight - window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY + ((i + 0.5) / steps.length) * total;
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
    } else {
      setCurrent(i);
    }
  };

  return (
    <div ref={outer} className="w-full lg:h-[220vh]">
      <div className="relative isolate flex flex-wrap items-center justify-center gap-12 px-5 py-14 md:px-6 lg:sticky lg:top-[66px] lg:h-[calc(100svh-66px)] lg:flex-nowrap lg:py-0">
        {backdrop}
        <div className="relative flex min-w-0 flex-[0_1_460px] flex-col gap-3.5 rounded-[28px] border border-line bg-surface p-7 shadow-[0_12px_32px_rgba(20,46,34,.08)]">
          <span className="text-lg font-bold text-brand">{`${current + 1}/${steps.length}`}</span>
          {head}
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {steps.map(([title, body], i) => {
              const on = i === current;
              return (
                <li key={title}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(i)}
                    className={`flex w-full cursor-pointer gap-3.5 rounded-[18px] border p-4 text-left font-[inherit] text-ink transition-colors hover:border-brand/40 ${
                      on ? "border-brand/40 bg-brand-soft" : "border-line bg-surface"
                    }`}
                  >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors ${on ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}
                    >
                      {i + 1}
                    </span>
                    <span>
                      <span className="block font-bold">{title}</span>
                      <span className="block text-[15px] text-ink-body">{body}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="relative">
          {/* all screens share one grid cell; the current one slides up into place */}
          <div className="grid place-items-center">
            {visuals.map((v, i) => (
              <div
                key={i}
                aria-hidden={i !== current}
                className={`[grid-area:1/1] transition-all duration-500 motion-reduce:transition-none ${
                  i === current ? "translate-y-0 opacity-100" : `pointer-events-none opacity-0 ${i < current ? "-translate-y-10" : "translate-y-10"}`
                }`}
              >
                {v}
              </div>
            ))}
          </div>
          {decor}
        </div>
      </div>
    </div>
  );
}

/** Phone frame for the chat screens (an illustration: hidden from screen readers). */
export function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div aria-hidden="true" className="box-border h-[540px] w-[290px] shrink-0 rounded-[46px] bg-[#16301F] p-2.5 shadow-[0_24px_50px_rgba(20,46,34,.22)] lg:h-[min(540px,calc(100svh-120px))]">
      <div className="force-light flex h-full flex-col overflow-hidden rounded-[37px] bg-[#DCEBFD] text-xs leading-snug">{children}</div>
    </div>
  );
}

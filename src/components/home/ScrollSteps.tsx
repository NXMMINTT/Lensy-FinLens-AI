"use client";

import { useEffect, useRef, useState } from "react";

const DESKTOP = "(min-width: 1024px)";

/**
 * Feature card (heading + numbered steps) next to its visual. With one visual per step it becomes
 * scroll-driven on desktop: the row stays pinned while the page scrolls past, and each stretch of
 * scrolling moves to the next step, sliding the matching screen up. On smaller screens the steps are tappable.
 */
export function ScrollSteps({
  head,
  steps,
  visuals,
  decor,
  badge,
  reverse = false,
  active = 0,
}: {
  badge?: React.ReactNode;
  /** visual on the left */
  reverse?: boolean;
  head: React.ReactNode;
  steps: [string, string][];
  visuals: React.ReactNode[];
  /** stays put beside the visual (e.g. the mascot) */
  decor?: React.ReactNode;
  active?: number;
}) {
  const interactive = visuals.length === steps.length && steps.length > 1;
  const [current, setCurrent] = useState(interactive ? 0 : active);
  const outer = useRef<HTMLDivElement>(null);

  // progress through the tall wrapper → step index
  useEffect(() => {
    if (!interactive) return;
    const onScroll = () => {
      const el = outer.current;
      if (!el || !window.matchMedia(DESKTOP).matches) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      setCurrent(Math.min(steps.length - 1, Math.floor(p * steps.length)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [interactive, steps.length]);

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

  const row = (
    <>
      <div className="relative flex min-w-0 flex-[0_1_460px] flex-col gap-3.5 rounded-[28px] bg-surface p-7 shadow-[0_10px_30px_rgba(26,111,214,.08)]">
        {(interactive || badge) && (
          <div className="flex items-center gap-2.5">
            {interactive && <span className="text-lg font-bold text-brand">{`${current + 1}/${steps.length}`}</span>}
            {badge}
          </div>
        )}
        {head}
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {steps.map(([title, body], i) => {
            const on = i === current;
            const content = (
              <>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors ${on ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}>
                  {i + 1}
                </span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="block text-[15px] text-ink-body">{body}</span>
                </span>
              </>
            );
            const box = `flex w-full gap-3.5 rounded-[18px] border p-4 text-left transition-colors ${on ? "border-sky-line bg-brand-soft" : "border-line bg-surface"}`;
            return (
              <li key={title}>
                {interactive ? (
                  <button type="button" aria-pressed={on} onClick={() => pick(i)} className={`${box} cursor-pointer font-[inherit] text-ink hover:border-sky-line`}>
                    {content}
                  </button>
                ) : (
                  <div className={box}>{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="relative">
        {interactive ? (
          // all screens share one grid cell; the current one slides up into place
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
        ) : (
          visuals[0]
        )}
        {decor}
      </div>
    </>
  );

  if (!interactive) return row;
  return (
    <div ref={outer} className="w-full lg:h-[220vh]">
      <div className={`flex flex-wrap items-center justify-center gap-14 lg:sticky lg:top-[68px] lg:h-[calc(100svh-68px)] lg:flex-nowrap ${reverse ? "lg:flex-row-reverse" : ""}`}>{row}</div>
    </div>
  );
}

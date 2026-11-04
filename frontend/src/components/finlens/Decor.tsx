/* Decorative sparkles, red-panda paws and curls in the FinLens greens (aria-hidden, no layout). */
import { Curl } from "@/components/decor/Curl";
import { Paw } from "@/components/decor/Paw";
import { Twinkle } from "@/components/decor/Twinkle";

export const DECOR = {
  bright: "#54D110",
  deep: "#1A7637",
  mint: "#9FD8B0",
  pale: "#C9E6DF",
  white: "#FFFFFF",
} as const;

/** Twinkle that slowly pulses (reduced-motion users get a still star via globals.css). */
export function Sparkle({ className = "", color = DECOR.bright, delay = 0 }: { className?: string; color?: string; delay?: number }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute animate-sparkle ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <Twinkle className="!static h-full w-full" color={color} />
    </span>
  );
}

/** Around the hero document art: sparkles, a paw and a curl, like a sticker sheet. */
export function HeroDecor() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Sparkle className="left-[0%] top-[0%] h-10 w-10" color={DECOR.bright} />
      <Sparkle className="left-[9%] top-[13%] h-4 w-4" color={DECOR.deep} delay={600} />
      <Sparkle className="right-[0%] top-[-2%] h-12 w-12" color={DECOR.bright} delay={300} />
      <Sparkle className="right-[10%] top-[11%] h-5 w-5" color={DECOR.deep} delay={900} />
      <Sparkle className="right-[-2%] top-[38%] h-6 w-6" color={DECOR.mint} delay={1500} />
      <Sparkle className="bottom-[4%] left-[18%] h-7 w-7" color={DECOR.mint} delay={1200} />
      <Sparkle className="bottom-[22%] left-[-2%] h-4 w-4" color={DECOR.deep} delay={450} />
      <Sparkle className="bottom-[-2%] right-[34%] h-5 w-5" color={DECOR.bright} delay={750} />
      <Paw className="bottom-[14%] left-[2%] h-11 w-11 -rotate-12" color={DECOR.bright} />
      <Paw className="right-[3%] top-[52%] h-7 w-7 rotate-12 opacity-70" color={DECOR.mint} />
      <Curl className="bottom-[0%] right-[20%] h-11 w-11" color={DECOR.bright} />
      <Curl className="left-[20%] top-[-3%] h-8 w-8 -scale-x-100 opacity-70" color={DECOR.mint} />
    </span>
  );
}

/** A few sparkles in the empty space on the left of the hero text. */
export function HeroTextDecor() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 max-lg:hidden">
      <Sparkle className="left-[-3%] top-[8%] h-6 w-6" color={DECOR.bright} delay={200} />
      <Sparkle className="left-[1%] top-[16%] h-3 w-3" color={DECOR.deep} delay={800} />
      <Sparkle className="bottom-[4%] left-[40%] h-4 w-4" color={DECOR.mint} delay={1400} />
    </span>
  );
}

/** Sparkles either side of a centred section title. */
export function TitleDecor() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 max-md:hidden">
      <Sparkle className="-left-12 top-0 h-7 w-7" color={DECOR.bright} />
      <Sparkle className="-left-5 top-9 h-3.5 w-3.5" color={DECOR.deep} delay={700} />
      <Sparkle className="-right-12 top-1 h-5 w-5" color={DECOR.mint} delay={350} />
      <Curl className="-right-16 top-8 h-7 w-7" color={DECOR.bright} />
    </span>
  );
}

/** Around a mascot picture. */
export function MascotDecor({ light = false }: { light?: boolean }) {
  const a = light ? DECOR.white : DECOR.bright;
  const b = light ? DECOR.pale : DECOR.deep;
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Sparkle className="-right-2 top-0 h-6 w-6" color={a} />
      <Sparkle className="right-6 top-8 h-3 w-3" color={b} delay={600} />
      <Sparkle className="-left-3 bottom-6 h-4 w-4" color={a} delay={1100} />
      <Paw className="-left-6 top-4 h-6 w-6 -rotate-12 opacity-70" color={light ? DECOR.pale : DECOR.mint} />
    </span>
  );
}

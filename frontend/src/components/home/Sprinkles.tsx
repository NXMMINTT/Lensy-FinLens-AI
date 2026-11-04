import { Curl } from "@/components/decor/Curl";
import { Paw } from "@/components/decor/Paw";
import { Twinkle } from "@/components/decor/Twinkle";

/** Twinkles, a paw and a curl around a feature visual; `mirror` swaps sides. Desktop only. */
export function Sprinkles({ mirror = false }: { mirror?: boolean }) {
  return (
    <span aria-hidden="true" className="max-lg:hidden">
      <Twinkle className={`top-6 h-8 w-8 ${mirror ? "-left-14" : "-right-14"}`} />
      <Twinkle className={`top-20 h-4 w-4 ${mirror ? "-left-6" : "-right-6"}`} color="#1A7637" />
      <Twinkle className={`top-[38%] h-5 w-5 ${mirror ? "-right-12" : "-left-12"}`} color="#BBD8FB" />
      <Paw className={`top-[56%] h-8 w-8 -rotate-12 opacity-80 ${mirror ? "-right-12" : "-left-12"}`} />
      <Curl className={`top-[45%] h-8 w-8 ${mirror ? "-left-16" : "-right-16"}`} />
    </span>
  );
}

/* ── phone mockups (illustrations of the LINE chat, aria-hidden) ── */

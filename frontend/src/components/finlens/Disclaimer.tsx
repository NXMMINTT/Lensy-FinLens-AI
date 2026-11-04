import { DISCLAIMER } from "@/lib/disclaimer";

/** project brief rule 5: on every page. */
export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`m-0 flex items-center gap-2 text-[15px] text-ink-muted ${className}`}>
      <span aria-hidden="true">ⓘ</span>
      {DISCLAIMER}
    </p>
  );
}

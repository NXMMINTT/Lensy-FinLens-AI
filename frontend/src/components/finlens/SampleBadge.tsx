import { SAMPLE_DATA_LABEL } from "@/lib/disclaimer";

/** project brief rule 7: sample data must be labelled. */
export function SampleBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-sun-ink/50 bg-sun-soft px-2 py-0.5 text-[11px] font-bold text-sun-ink ${className}`}>
      {SAMPLE_DATA_LABEL}
    </span>
  );
}

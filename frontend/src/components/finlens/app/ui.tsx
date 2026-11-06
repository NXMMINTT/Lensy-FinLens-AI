/* Small building blocks for the dashboard pages (server-safe: no hooks). */
import type { RiskLevel } from "@/lib/riskRules";
import { RISK_LEVEL_LABEL } from "@/lib/riskRules";
import type { DocSource } from "@/lib/schema";
import { SOURCE_LABEL } from "@/lib/sources";

export { SOURCE_LABEL } from "@/lib/sources";

/** Page tag that opens to show the quoted text from the document (works without JS). */
export function SourceChip({ page, source, quote, className = "" }: { page: number; source: DocSource; quote?: string | null; className?: string }) {
  const label = `หน้า ${page} · ${SOURCE_LABEL[source]}`;
  if (!quote) return <span className={`inline-flex rounded-md bg-line-subtle px-1.5 py-0.5 text-[12px] text-ink-muted ${className}`}>{label}</span>;
  return (
    <details className={`group relative inline-block align-middle ${className}`}>
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md bg-line-subtle px-1.5 py-0.5 text-[12px] text-ink-muted hover:bg-brand-soft hover:text-brand [&::-webkit-details-marker]:hidden">
        {label}
        <span aria-hidden="true" className="text-[10px] transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <span className="absolute left-0 z-20 mt-1 block w-[min(320px,80vw)] rounded-xl border border-line bg-surface p-3 text-[13px] leading-relaxed text-ink-body shadow-lg">
        <span className="mb-1 block text-[11px] font-semibold text-ink-muted">ข้อความในเอกสาร</span>“{quote}”
      </span>
    </details>
  );
}

const LEVEL_CLASS: Record<RiskLevel, string> = {
  high: "bg-danger-soft text-danger-ink border-danger-line",
  medium: "bg-sun-soft text-sun-ink border-sun/60",
  info: "bg-sky text-ink-body border-sky-line",
};

export function RiskBadge({ level, className = "" }: { level: RiskLevel; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[12px] font-bold ${LEVEL_CLASS[level]} ${className}`}>
      <span aria-hidden="true">{level === "high" ? "▲" : level === "medium" ? "●" : "i"}</span>
      {RISK_LEVEL_LABEL[level]}
    </span>
  );
}

/** The fund's risk level 1–8 as the document states it, drawn as 8 steps. */
export function RiskMeter({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label={`ระดับความเสี่ยง ${level} จาก 8`}>
      <span className="flex gap-[3px]" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className={`h-3 w-2 rounded-[2px] ${i < level ? (i >= 5 ? "bg-ink-body" : "bg-ink-muted") : "bg-line"}`} />
        ))}
      </span>
      <b className="text-[14px] text-ink">{level}/8</b>
    </span>
  );
}

export function Card({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`scroll-mt-24 rounded-[24px] border border-line bg-surface p-5 md:p-6 ${className}`}>
      {children}
    </section>
  );
}

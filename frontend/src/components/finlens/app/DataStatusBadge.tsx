import { thaiDate, type DataStatus } from "@/lib/dataStatus";

import { SOURCE_LABEL as SOURCE } from "@/lib/sources";

/**
 * Data status for one fund: "checked against the documents" or "incomplete" (with what is missing),
 * and the document's as-of date with its page. Missing items read as "not found", never as zero.
 */
export function DataStatusBadge({ status, compact = false, chipOnly = false }: { status: DataStatus; compact?: boolean; chipOnly?: boolean }) {
  // sample data: say so, and show neither a check mark nor a document date
  if (status.kind === "sample") {
    return (
      <span className="inline-flex items-center gap-1 self-start rounded-full border border-sun/60 bg-sun-soft px-2 py-0.5 text-[12px] font-bold text-sun-ink">
        ! {status.label}
      </span>
    );
  }
  const ok = status.kind === "verified";
  if (chipOnly) {
    return (
      <span
        title={status.asOf ? `ข้อมูล ณ ${thaiDate(status.asOf.value)}` : undefined}
        className={`inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5 text-[11.5px] font-bold ${ok ? "bg-success-soft text-success-ink" : "bg-sun-soft text-sun-ink"}`}
      >
        {ok ? "✓" : "!"} {status.label}
      </span>
    );
  }
  return (
    <span className="flex flex-col gap-0.5">
      <span
        className={`inline-flex items-center gap-1 self-start rounded-full border px-2 py-0.5 text-[12px] font-bold ${
          ok ? "border-success-line bg-success-soft text-success-ink" : "border-sun/60 bg-sun-soft text-sun-ink"
        }`}
      >
        {ok ? "✓" : "!"} {status.label}
      </span>
      {!ok && !compact && status.missing.length > 0 && <span className="text-[12px] text-ink-muted">ไม่พบในเอกสาร: {status.missing.join(", ")}</span>}
      {status.asOf ? (
        <span className="text-[12px] text-ink-muted">
          ข้อมูล ณ {thaiDate(status.asOf.value)}
          {status.asOf.page !== null ? ` · หน้า ${status.asOf.page} ${SOURCE[status.asOf.source]}` : ""}
        </span>
      ) : (
        <span className="text-[12px] text-ink-muted">ไม่พบวันที่ของข้อมูลในเอกสาร</span>
      )}
      {status.dataSource && <span className="text-[12px] text-ink-muted">ที่มาของข้อมูล: {status.dataSource}</span>}
    </span>
  );
}

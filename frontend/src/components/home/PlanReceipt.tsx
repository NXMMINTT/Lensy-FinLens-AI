import { ReceiptEdge } from "@/components/decor/ReceiptEdge";

/** A plan drawn as a shop receipt (ใบเสร็จ). */
export function PlanReceipt({
  name,
  subtitle,
  price,
  per,
  lines,
  highlight = false,
  badge = "ลองฟรี 7 วัน",
}: {
  name: string;
  subtitle: string;
  price: string;
  per?: string;
  lines: string[];
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <div className="relative drop-shadow-[0_14px_24px_rgba(20,46,34,.12)]">
      <div className="flex flex-col gap-3 rounded-t-2xl bg-surface px-7 pb-6 pt-7">
        <div className="flex items-center justify-between gap-3">
          <h3 className={`m-0 text-[28px] font-extrabold ${highlight ? "text-brand" : ""}`}>{name}</h3>
          {highlight && badge && <span className="rounded-full bg-sun px-3 py-1 text-sm font-bold text-[#4A3500]">{badge}</span>}
        </div>
        <p className="m-0 text-ink-muted">{subtitle}</p>
        <ul className="m-0 flex list-none flex-col gap-2 border-y-2 border-dashed border-line p-0 py-4">
          {lines.map((l) => (
            <li key={l} className="flex gap-2.5">
              <span className="font-bold text-brand">✓</span>
              {l}
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between">
          <span className="font-bold text-ink-muted">รวม</span>
          <span className="text-[40px] font-extrabold leading-tight">
            {price} {per && <span className="text-[17px] font-medium text-ink-muted">{per}</span>}
          </span>
        </div>
      </div>
      <ReceiptEdge />
    </div>
  );
}

import Link from "next/link";

import { refPath, REF_STATUS_LABEL, shortAsOf, type RefCardData, type RefStatus } from "@/lib/referenceShared";

const STATUS_STYLE: Record<RefStatus, string> = {
  official: "border-success-line bg-success-soft text-success-ink",
  "source-checked": "border-success-line bg-success-soft text-success-ink",
  definition: "border-line bg-sky text-ink-body",
  media: "border-line bg-sky text-ink-body",
  partial: "border-sun/60 bg-sun-soft text-sun-ink",
  stale: "border-sun/60 bg-sun-soft text-sun-ink",
  unchecked: "border-line bg-surface text-ink-muted",
};
const STATUS_MARK: Record<RefStatus, string> = { official: "✓", "source-checked": "✓", definition: "i", media: "i", partial: "!", stale: "!", unchecked: "?" };

export function RefStatusBadge({ status }: { status: RefStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 self-start whitespace-nowrap rounded-full border px-2 py-0.5 text-[12px] font-bold ${STATUS_STYLE[status]}`}>
      <span aria-hidden="true">{STATUS_MARK[status]}</span> {REF_STATUS_LABEL[status]}
    </span>
  );
}

/** Topic card, same layout as the fund cards: code chip, title, status, one figure with its date, "ดูรายละเอียด". */
export function RefCard({ item, catTitle }: { item: RefCardData; catTitle?: string }) {
  const pointer = !item.headline && /^ดู(?:หัวข้อ|หมวด)? \d/.test(item.summary);
  return (
    <li className="group relative flex flex-col overflow-hidden rounded-[22px] border border-line bg-surface transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-[0_14px_30px_-18px_rgba(20,46,34,.45)]">
      <div className="flex flex-col gap-2 px-5 pb-4 pt-5">
        <span className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-sky px-2.5 py-0.5 text-[12px] font-bold tracking-wide text-ink-body">{item.id}</span>
          {catTitle && <span className="truncate text-[12px] text-ink-muted">หมวด {item.cat} {catTitle}</span>}
        </span>
        <h3 className="m-0 line-clamp-2 min-h-[2.75em] text-[16.5px] font-bold leading-snug">
          {/* the link covers the whole card */}
          <Link href={refPath(item.id, item.status)} className="text-ink no-underline after:absolute after:inset-0">
            {item.title}
          </Link>
        </h3>
        <RefStatusBadge status={item.status} />
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-line-subtle px-5 py-4">
        {item.headline ? (
          <>
            <span className="text-[12px] text-ink-muted">ตัวเลขล่าสุด</span>
            <b className="text-[26px] leading-tight text-brand">{item.headline.value}</b>
            <span className="line-clamp-2 text-[13px] text-ink-body">{item.headline.label}</span>
          </>
        ) : (
          <>
            <span className="text-[12px] text-ink-muted">{pointer ? "ข้อมูลอยู่ที่" : "สาระสำคัญ"}</span>
            <span className="line-clamp-3 text-[14px] text-ink-body">{item.summary || "ยังไม่มีตัวเลขในรอบนี้"}</span>
          </>
        )}
        {item.asOf && <span className="mt-1 truncate text-[12px] text-ink-muted">ข้อมูล ณ {shortAsOf(item.asOf)}</span>}
      </div>

      <div className="flex items-center justify-between border-t border-line-subtle bg-brand-tint/60 px-5 py-3 text-[14px] font-bold text-brand">
        ดูรายละเอียด
        <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </li>
  );
}

export function RefCardGrid({ items }: { items: RefCardData[] }) {
  return (
    <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <RefCard key={it.id} item={it} />
      ))}
    </ul>
  );
}

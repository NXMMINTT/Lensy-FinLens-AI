import Link from "next/link";

import { Disclaimer } from "../Disclaimer";
import { Lensy, type LensyPose } from "../Lensy";

/**
 * Same header on every dashboard page, so each menu tile clearly lands on its own page:
 * back to the menu, a label, the title, one line of what the page does, and Lensy in that tile's pose.
 */
export function PageHeader({
  label,
  title,
  mark,
  text,
  pose,
  badge,
}: {
  label: string;
  title: string;
  /** highlighted end of the title */
  mark?: string;
  text: string;
  pose: LensyPose;
  badge?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4">
      <Link href="/funds" className="self-start text-[14px] font-semibold text-ink-muted no-underline hover:text-brand">
        ← เมนูทั้งหมด
      </Link>
      <div className="flex items-center justify-between gap-4 rounded-[24px] border border-line bg-brand-tint px-5 py-5 md:px-7">
        <div className="flex max-w-[720px] flex-col gap-2">
          <span className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-brand/30 bg-surface px-3 py-1 text-[14px] font-semibold text-brand">{label}</span>
            {badge}
          </span>
          <h1 className="m-0 text-[28px] font-bold leading-tight md:text-[36px]">
            {title} {mark && <span className="marker-green">{mark}</span>}
          </h1>
          <p className="m-0 text-ink-body">{text}</p>
          <Disclaimer className="text-[14px]" />
        </div>
        <Lensy pose={pose} size={110} className="max-sm:hidden" />
      </div>
    </header>
  );
}

export const SOON_BADGE = <span className="rounded-full bg-sun px-2.5 py-0.5 text-[12px] font-bold text-[#4A3500]">Premium · เร็ว ๆ นี้</span>;

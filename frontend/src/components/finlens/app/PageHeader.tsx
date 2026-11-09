import { Lensy, type LensyPose } from "../Lensy";

/**
 * Same header on every dashboard page, so each menu tile clearly lands on its own page:
 * a label, the title, one line of what the page does, and Lensy in that tile's pose.
 * On a phone it stays short: smaller title, the description cut to two lines, no Lensy.
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
    <header className="force-light flex items-center justify-between gap-6 rounded-[24px] bg-gradient-to-br from-brand to-brand-dark px-5 py-5 text-white sm:rounded-[28px] sm:px-6 sm:py-7 md:px-10 md:py-8">
      <div className="flex min-w-0 max-w-[760px] flex-col gap-1.5 sm:gap-2.5">
        <span className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#BDF08A] sm:text-[14px]">
          {label}
          {badge}
        </span>
        <h1 className="m-0 text-[23px] font-bold leading-snug text-white sm:text-[28px] md:text-[36px]">
          {title} {mark && <span className="sm:whitespace-nowrap">{mark}</span>}
        </h1>
        <p className="m-0 line-clamp-2 max-w-[720px] text-[14.5px] leading-relaxed text-white/90 sm:line-clamp-none sm:text-[16px]">{text}</p>
      </div>
      <Lensy pose={pose} size={130} className="hidden shrink-0 sm:block" />
    </header>
  );
}


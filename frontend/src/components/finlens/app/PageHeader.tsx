import { Lensy, type LensyPose } from "../Lensy";

/**
 * Same header on every dashboard page, so each menu tile clearly lands on its own page:
 * a label, the title, one line of what the page does, and Lensy in that tile's pose.
 * The "not investment advice" line is in the footer of every page (AppShell → LandingFooter).
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
    <header className="force-light flex items-center justify-between gap-6 rounded-[28px] bg-gradient-to-br from-brand to-brand-dark px-6 py-7 text-white md:px-10 md:py-8">
      <div className="flex min-w-0 max-w-[760px] flex-col gap-2.5">
        <span className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-[#BDF08A]">
          {label}
          {badge}
        </span>
        <h1 className="m-0 text-[28px] font-bold leading-snug text-white md:text-[36px]">
          {title} {mark && <span className="whitespace-nowrap">{mark}</span>}
        </h1>
        <p className="m-0 max-w-[720px] text-[16px] leading-relaxed text-white/90">{text}</p>
      </div>
      <Lensy pose={pose} size={130} className="hidden shrink-0 sm:block" />
    </header>
  );
}

export const SOON_BADGE = <span className="rounded-full bg-sun px-2.5 py-0.5 text-[12px] font-bold text-[#4A3500]">Premium · เร็ว ๆ นี้</span>;

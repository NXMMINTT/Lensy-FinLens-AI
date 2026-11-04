import { type FoxPose, UFox } from "@/components/brand/UFox";

export function FeatureCard({
  title,
  body,
  tag,
  tagLeft = false,
  fox,
  children,
}: {
  title: string;
  body: string;
  tag?: string;
  tagLeft?: boolean;
  fox?: FoxPose;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 overflow-hidden rounded-[26px] border border-line bg-brand-tint px-6 pt-6 transition-transform duration-300 hover:-translate-y-1">
      <h3 className="m-0 text-[21px] font-bold">{title}</h3>
      <p className="m-0 text-[15px] text-ink-muted">{body}</p>
      <div className="relative mt-4 h-[210px]" aria-hidden="true">
        {children}
        {fox && <UFox pose={fox} size={118} className={`absolute bottom-0 ${tagLeft ? "right-0" : "left-0"}`} />}
        {tag && (
          <span
            className={`absolute top-4 rounded-2xl px-3.5 py-2 text-[15px] font-semibold shadow-[0_6px_16px_rgba(0,0,0,.08)] ${
              tagLeft ? "left-2 bg-surface text-brand" : "right-2 bg-chat text-[#0F2A12]"
            }`}
          >
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}

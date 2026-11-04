import { ScrollSteps } from "@/components/home/ScrollSteps";

export function FeatureSection({
  id,
  title,
  intro,
  steps,
  active = 0,
  visuals,
  decor,
  visualFirst = false,
  premium = false,
}: {
  id: string;
  title: React.ReactNode;
  intro: string;
  steps: [string, string][];
  active?: number;
  /** one visual, or one per step to make the steps clickable */
  visuals: React.ReactNode[];
  decor?: React.ReactNode;
  visualFirst?: boolean;
  premium?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 px-6 pb-16 pt-10">
      <div className={`mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-14 ${visualFirst ? "flex-row-reverse" : ""}`}>
        <ScrollSteps
          steps={steps}
          active={active}
          visuals={visuals}
          decor={decor}
          reverse={visualFirst}
          badge={premium && <span className="rounded-full bg-sun px-2.5 py-0.5 text-[13px] font-bold text-[#4A3500]">Premium</span>}
          head={
            <>
              <h2 id={`${id}-title`} className="m-0 text-4xl font-extrabold leading-snug">
                {title}
              </h2>
              <p className="m-0 text-ink-body">{intro}</p>
            </>
          }
        />
      </div>
    </section>
  );
}

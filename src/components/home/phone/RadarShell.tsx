/** The /market web page on a phone: page header, product chip and the sections below it. */
export function RadarShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden bg-brand-tint px-3 pb-3 pt-[18px]">
      <div>
        <div className="text-[10px] font-semibold text-brand">ส่องตลาดแบบเนียนๆ</div>
        <b className="text-base leading-tight">Market Radar</b>
      </div>
      <span className="self-start rounded-full bg-brand px-3 py-0.5 font-semibold text-white">น้ำพริกเผา</span>
      {children}
    </div>
  );
}

/** Same card shape as InfoCard on /market. */
export function RadarCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="flex shrink-0 flex-col gap-2 rounded-[18px] bg-surface p-3">
      <div>
        <b className="text-[13px]">{title}</b>
        {subtitle && <p className="m-0 text-[10px] text-ink-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

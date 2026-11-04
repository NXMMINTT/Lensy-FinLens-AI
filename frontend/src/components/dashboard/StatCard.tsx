export function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-[26px] px-7 py-6 ${highlight ? "bg-brand text-white" : "bg-surface"}`}>
      <div className={`text-[15px] ${highlight ? "text-sky-deep" : "text-ink-muted"}`}>{label}</div>
      <div className="text-[32px] font-semibold leading-snug">{value}</div>
    </div>
  );
}

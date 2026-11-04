export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  const toneClasses = {
    success: "bg-success-soft text-success-ink",
    warning: "bg-sun-soft text-sun-ink",
    danger: "bg-danger-soft text-expense",
    info: "bg-brand-soft text-brand",
    neutral: "bg-line-subtle text-ink-body",
  }[tone];

  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-0.5 text-[13px] font-bold ${toneClasses}`}>
      {children}
    </span>
  );
}

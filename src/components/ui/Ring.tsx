/** Ring gauge (0–1) used by the tax meter. */
export function Ring({ ratio, size = 150, color = "#FFC83D", children }: { ratio: number; size?: number; color?: string; children?: React.ReactNode }) {
  const r = 74;
  const dash = Math.max(0, Math.min(1, ratio)) * 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 180 180" className="block h-full w-full" aria-hidden="true">
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgb(var(--brand-soft))" strokeWidth="18" />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${dash} 1000`}
          transform="rotate(-90 90 90)"
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">{children}</div>
    </div>
  );
}

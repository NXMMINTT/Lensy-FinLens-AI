/** Curly hand-drawn arrow; rotate/flip it with className. */
export function CurlyArrow({ className = "", color = "#1A7637" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 70" className={className} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 10c20-6 44 2 44 18 0 12-16 14-16 4 0-12 30-18 52 0 10 8 16 18 20 28" />
      <path d="M96 48l10 12 4-15" />
    </svg>
  );
}

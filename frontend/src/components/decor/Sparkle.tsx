/** Little four-point sparkle. */
export function Sparkle({ className = "", color = "#54D110" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill={color} />
    </svg>
  );
}

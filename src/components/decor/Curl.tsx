/** Small curl, like the fox's tail flick. */
export function Curl({ className = "", color = "#54D110" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <path d="M6 24c-3-6 1-14 9-14 6 0 9 6 5 9-3 2-6 0-5-3" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

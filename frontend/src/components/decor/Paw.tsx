/** Red-panda paw print. */
export function Paw({ className = "", color = "#1A7637" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <g fill={color}>
        <ellipse cx="16" cy="22" rx="8" ry="7" />
        <ellipse cx="6" cy="13" rx="3.2" ry="4" transform="rotate(-20 6 13)" />
        <ellipse cx="12.5" cy="7" rx="3.2" ry="4.2" transform="rotate(-6 12.5 7)" />
        <ellipse cx="19.5" cy="7" rx="3.2" ry="4.2" transform="rotate(6 19.5 7)" />
        <ellipse cx="26" cy="13" rx="3.2" ry="4" transform="rotate(20 26 13)" />
      </g>
    </svg>
  );
}

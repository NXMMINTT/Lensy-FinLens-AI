/** Soft four-point twinkle, as on the U-Fox stickers. */
export function Twinkle({ className = "", color = "#54D110" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <path d="M12 0C12.8 7.6 16.4 11.2 24 12C16.4 12.8 12.8 16.4 12 24C11.2 16.4 7.6 12.8 0 12C7.6 11.2 11.2 7.6 12 0Z" fill={color} />
    </svg>
  );
}

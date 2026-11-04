/** Starburst sticker. Wiggles on hover. */
export function Sticker({ children, className = "", tilt = 8, color = "#FFC83D" }: { children: React.ReactNode; className?: string; tilt?: number; color?: string }) {
  return (
    <span className={`group inline-grid place-items-center ${className}`} style={{ transform: `rotate(${tilt}deg)` }}>
      <svg viewBox="0 0 100 100" className="col-start-1 row-start-1 h-full w-full drop-shadow-[0_6px_10px_rgba(20,46,34,.18)] group-hover:animate-wiggle" aria-hidden="true">
        <path
          d="M50 2l9 13 15-6 2 16 16 2-6 15 13 9-13 9 6 15-16 2-2 16-15-6-9 13-9-13-15 6-2-16-16-2 6-15L2 50l13-9-6-15 16-2 2-16 15 6z"
          fill={color}
        />
      </svg>
      {/* relative: the svg's drop-shadow filter would otherwise paint over the text */}
      <span className="relative col-start-1 row-start-1 px-3 text-center font-hand font-bold leading-tight text-[#4A3500]">{children}</span>
    </span>
  );
}

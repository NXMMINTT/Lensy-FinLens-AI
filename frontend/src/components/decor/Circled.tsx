/** Loose hand-drawn ring around a number or word. */
export function Circled({ children, color = "#F26B5B" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="relative inline-block px-2">
      {children}
      <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-1 -inset-y-2 h-[calc(100%+16px)] w-[calc(100%+8px)]" aria-hidden="true">
        <path d="M150 8 C 190 14, 200 52, 150 70 C 100 84, 20 76, 8 46 C -2 18, 50 4, 120 6" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

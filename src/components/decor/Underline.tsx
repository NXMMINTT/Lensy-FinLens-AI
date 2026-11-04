/** Wavy underline drawn under a word. Wrap the word: <Underline>U-Fox</Underline> */
export function Underline({ children, color = "#FFC83D" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="relative z-[1]">{children}</span>
      <svg viewBox="0 0 200 16" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-3.5 w-full" aria-hidden="true">
        <path d="M3 10 C 30 3, 50 14, 80 8 S 140 3, 197 9" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** Handwritten note (Mali), slightly tilted. */
export function Note({ children, className = "", tilt = -4 }: { children: React.ReactNode; className?: string; tilt?: number }) {
  return (
    <span className={`inline-block font-hand font-semibold text-brand ${className}`} style={{ transform: `rotate(${tilt}deg)` }}>
      {children}
    </span>
  );
}

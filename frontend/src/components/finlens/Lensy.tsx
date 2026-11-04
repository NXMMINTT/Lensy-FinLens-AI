/** น้อง Lensy, the green red panda. Swap public/panda.svg for the team's artwork. */
export function Lensy({ size = 160, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/panda.svg" alt="น้อง Lensy" width={size} height={size} className={`shrink-0 ${className}`} style={{ width: size, height: size }} />
  );
}

/** Round avatar for chat bubbles and the logo. */
export function LensyFace({ size = 40 }: { size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft" style={{ width: size, height: size }} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/panda.svg" alt="" width={size} height={size} style={{ width: size * 0.92, height: size * 0.92 }} />
    </span>
  );
}

import { LensyFace } from "./Lensy";

/** FinLens AI logo: Lensy's round face + the name as plain text (theme colors, so it works in dark mode). */
export function FinLensLogo({ height = 36 }: { height?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LensyFace size={height + 6} />
      <span className="whitespace-nowrap font-heading font-bold leading-none tracking-tight text-ink" style={{ fontSize: Math.round(height * 0.66) }}>
        FinLens <span className="text-brand">AI</span>
      </span>
    </span>
  );
}

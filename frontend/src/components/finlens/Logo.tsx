import { LensyFace } from "./Lensy";

/** FinLens AI logo: Lensy's round face + the wordmark (public/brand/finlens-wordmark.png, 364×118). */
export function FinLensLogo({ height = 36 }: { height?: number }) {
  const width = Math.round((height * 364) / 118);
  return (
    <span className="inline-flex items-center gap-2">
      <LensyFace size={height + 6} />
      {/* dark mode: the dark-green wordmark sits on a white pill so it stays readable */}
      <span className="inline-flex rounded-lg dark:bg-white dark:px-1.5 dark:py-0.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/finlens-wordmark.png" alt="FinLens AI" width={width} height={height} style={{ width, height }} />
      </span>
    </span>
  );
}

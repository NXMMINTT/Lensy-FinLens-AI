/** Round U-Fox avatar used as the logo mark and chat avatar. */
export function UFoxFace({ size = 40 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/mascot/u-fox-icon-round.png" alt="" aria-hidden="true" width={size} height={size} className="shrink-0 rounded-full" style={{ width: size, height: size }} />
  );
}

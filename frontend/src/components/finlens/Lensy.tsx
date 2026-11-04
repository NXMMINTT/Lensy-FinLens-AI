/**
 * น้อง Lensy, the green red panda.
 * Each pose maps to an image in public/. Until the team's PNGs (transparent background) are in
 * public/mascot/, every pose falls back to the placeholder public/panda.svg. To swap in the real art,
 * save e.g. public/mascot/lensy-magnifier.png and point the pose at it here.
 */
export type LensyPose = "wave" | "magnifier" | "chart" | "checklist" | "coins" | "idea" | "laptop" | "question" | "shield" | "heart";

const POSE_SRC: Record<LensyPose, string> = {
  wave: "/panda.svg",
  magnifier: "/panda.svg",
  chart: "/panda.svg",
  checklist: "/panda.svg",
  coins: "/panda.svg",
  idea: "/panda.svg",
  laptop: "/panda.svg",
  question: "/panda.svg",
  shield: "/panda.svg",
  heart: "/panda.svg",
};

const FACE_SRC = "/panda.svg";

export function Lensy({ size = 160, pose = "wave", className = "" }: { size?: number; pose?: LensyPose; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={POSE_SRC[pose]} alt="น้อง Lensy" width={size} height={size} className={`shrink-0 object-contain ${className}`} style={{ width: size, height: size }} />
  );
}

/** Round avatar for chat bubbles and the logo. */
export function LensyFace({ size = 40 }: { size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft" style={{ width: size, height: size }} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={FACE_SRC} alt="" width={size} height={size} style={{ width: size * 0.92, height: size * 0.92 }} />
    </span>
  );
}

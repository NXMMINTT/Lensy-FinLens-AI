/**
 * น้อง Lensy, the green red panda. Poses are cut from assets/lensy-sheet.png (transparent PNGs in
 * public/mascot/). public/panda.svg is the old placeholder, kept as a fallback.
 */
export type LensyPose = "wave" | "magnifier" | "chart" | "checklist" | "coins" | "idea" | "laptop" | "question" | "shield" | "heart";

const POSE_SRC: Record<LensyPose, string> = {
  wave: "/mascot/lensy-wave.png",
  magnifier: "/mascot/lensy-magnifier.png",
  chart: "/mascot/lensy-chart.png",
  checklist: "/mascot/lensy-checklist.png",
  coins: "/mascot/lensy-coins.png",
  idea: "/mascot/lensy-idea.png",
  laptop: "/mascot/lensy-laptop.png",
  question: "/mascot/lensy-question.png",
  shield: "/mascot/lensy-cheer.png",
  heart: "/mascot/lensy-heart.png",
};

const FACE_SRC = "/mascot/lensy-face.png";

export function Lensy({ size = 160, pose = "wave", className = "" }: { size?: number; pose?: LensyPose; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={POSE_SRC[pose]} alt="น้อง Lensy" width={size} height={size} className={`shrink-0 object-contain ${className}`} style={{ width: size, height: size }} />
  );
}

/** Round avatar for chat bubbles and the logo. */
export function LensyFace({ size = 40 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={FACE_SRC} alt="" aria-hidden="true" width={size} height={size} className="shrink-0 rounded-full" style={{ width: size, height: size }} />
  );
}

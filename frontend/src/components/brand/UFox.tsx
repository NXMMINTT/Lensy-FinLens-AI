/** U-Fox poses cut from the team's sticker sheet (public/mascot/u-fox-<pose>.png). */
export type FoxPose =
  | "wave" | "happy" | "cheer" | "love" | "question" | "shocked" | "sleep" | "proud"
  | "ledger" | "radar" | "global" | "commerce" | "idea" | "line" | "icon-round" | "icon-app" | "logo";

export type UFoxMood = "happy" | "worried" | "shocked" | "wink";

const MOOD_POSE: Record<UFoxMood, FoxPose> = { happy: "happy", wink: "cheer", worried: "question", shocked: "shocked" };

/** U-Fox as U-Fox, the project mascot. Pick a `pose`, or a `mood` (happy / wink / worried / shocked);
 * `wave` uses the waving pose; `look` (-1..1) tilts the fox toward the pointer. Decorative — callers label the context. */
export function UFox({
  size = 120,
  wave = false,
  mood = "happy",
  pose,
  look = { x: 0, y: 0 },
  className = "",
}: {
  size?: number;
  wave?: boolean;
  mood?: UFoxMood;
  pose?: FoxPose;
  look?: { x: number; y: number };
  className?: string;
}) {
  const p = pose ?? (wave && mood === "happy" ? "wave" : MOOD_POSE[mood]);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/mascot/u-fox-${p}.png`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      draggable={false}
      className={`object-contain ${className}`}
      style={{ width: size, height: size, transform: `rotate(${look.x * 6}deg) translateY(${look.y * 3}px)`, transition: "transform .2s ease-out" }}
    />
  );
}

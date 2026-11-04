import { categoryTint } from "@/components/market/categoryTint";

/** Category glyph from the catalog's SVG path, on its tinted tile. */
export function CategoryIcon({
  categoryId,
  path,
  size = 44,
  className = "",
}: {
  categoryId: string;
  path: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`grid flex-none place-items-center rounded-[10px] ${categoryTint(categoryId)} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size / 2}
        height={size / 2}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
    </span>
  );
}

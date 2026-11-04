import { CategoryIcon } from "@/components/market/CategoryIcon";
import { categoryPhoto } from "@/lib/market/categoryPhoto";

/** A real product photo for the category when one exists (see
 * public/products/CREDITS.md), falling back to CategoryIcon's SVG glyph
 * otherwise — same size/rounding either way so callers can swap freely. */
export function CategoryThumb({
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
  const photo = categoryPhoto(categoryId);
  if (!photo) return <CategoryIcon categoryId={categoryId} path={path} size={size} className={className} />;
  return (
    <span
      className={`grid flex-none place-items-center overflow-hidden rounded-[10px] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static product photo */}
      <img src={photo} alt="" className="h-full w-full object-cover" />
    </span>
  );
}

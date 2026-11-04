import { productImageSrc } from "@/lib/productImageSrc";

/** The shop's photo (or a stock photo by name, public/products/CREDITS.md), else the rank on a tinted tile. */
export function ProductThumb({ name, rank, tint, imageUrl }: { name: string; rank: number; tint: string; imageUrl?: string | null }) {
  const photo = productImageSrc(imageUrl, name);
  return (
    <span className="relative shrink-0">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="h-[52px] w-[52px] rounded-[18px] object-cover" />
      ) : (
        <span className={`grid h-[52px] w-[52px] place-items-center rounded-[18px] text-lg font-bold ${tint}`}>{rank}</span>
      )}
      {photo && (
        <span className="absolute -left-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-sun font-hand text-sm font-bold text-[#4A3500]">{rank}</span>
      )}
    </span>
  );
}

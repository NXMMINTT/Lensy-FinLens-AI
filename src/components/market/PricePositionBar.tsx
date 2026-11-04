/** Where the shop's price sits among competitors' prices (cheapest → priciest), with U-Fox's suggestion marked. */
export function PricePositionBar({
  competitorPrices,
  myPrice,
  suggestedPrice,
}: {
  competitorPrices: number[];
  myPrice: number;
  suggestedPrice?: number;
}) {
  if (competitorPrices.length === 0) return null;
  const all = [...competitorPrices, myPrice, ...(suggestedPrice ? [suggestedPrice] : [])];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const at = (price: number) => `${((price - min) / span) * 100}%`;
  const cheaperThanMe = competitorPrices.filter((p) => p < myPrice).length;
  const pricierThanMe = competitorPrices.filter((p) => p > myPrice).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative mx-3 h-24" aria-hidden="true">
        <div className="absolute inset-x-0 top-11 h-2.5 rounded-full bg-gradient-to-r from-success-soft via-brand-soft to-danger-soft" />
        {competitorPrices.map((p, i) => (
          <span
            key={i}
            className={`absolute top-[40px] h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-surface ${
              p < myPrice ? "bg-[#34D399]" : "bg-[#F08A8A]"
            }`}
            style={{ left: at(p) }}
          />
        ))}
        {suggestedPrice !== undefined && (
          <span className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: at(suggestedPrice) }}>
            <span className="whitespace-nowrap rounded-full bg-sun px-2.5 py-0.5 text-xs font-bold text-[#4A3500]">แนะนำ ฿{suggestedPrice}</span>
            <span className="h-4 w-0.5 bg-sun" />
          </span>
        )}
        <span className="absolute top-[46px] flex -translate-x-1/2 flex-col items-center" style={{ left: at(myPrice) }}>
          <span className="h-4 w-0.5 bg-brand" />
          <span className="whitespace-nowrap rounded-full bg-brand px-2.5 py-0.5 text-xs font-bold text-white">คุณ ฿{myPrice}</span>
        </span>
      </div>
      <div className="flex justify-between text-xs text-ink-muted">
        <span>ถูกสุด ฿{min.toLocaleString("en-US")}</span>
        <span>แพงสุด ฿{max.toLocaleString("en-US")}</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-ink-body">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#34D399]" />
          ถูกกว่าคุณ <b>{cheaperThanMe}</b> ร้าน
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F08A8A]" />
          แพงกว่าคุณ <b>{pricierThanMe}</b> ร้าน
        </span>
      </div>
    </div>
  );
}

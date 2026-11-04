import { UFox } from "@/components/brand/UFox";
import { ProductThumb } from "@/components/dashboard/ProductThumb";
import { LineIcon } from "@/components/ui/LineIcon";

/** Tax step 3: the yearly summary, styled like MonthSummaryCards + BestSellers on /dashboard/summary. */
export function ProfitSummaryCard() {
  const bestSellers: [string, string, string, string][] = [
    ["น้ำพริกตาแดง", "8,790 กระปุก", "120", "฿782,310"],
    ["สบู่มะกรูด", "5,134 ก้อน", "64", "฿302,906"],
    ["กระเป๋าผ้าทอ", "505 ใบ", "18", "฿176,750"],
  ];
  return (
    <div aria-hidden="true" className="flex w-[340px] max-w-full flex-col gap-4 rounded-[30px] bg-surface p-6 shadow-[0_24px_50px_rgba(20,46,34,.14)]">
      <div className="flex items-center gap-2">
        <h2 className="m-0 text-[18px] font-bold text-ink">สรุปภาพรวมปี 2569</h2>
        <UFox size={56} pose="commerce" className="-mr-2 -mt-3 ml-auto" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-success-soft p-3">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-success-line text-success-ink">
              <LineIcon name="trendUp" size={14} />
            </span>
            <span className="text-[13px] font-semibold text-success-ink">รายรับ</span>
          </div>
          <div className="text-[18px] font-extrabold text-success-ink">฿1,262,000</div>
        </div>
        <div className="rounded-2xl bg-danger-soft p-3">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-danger-line text-danger-ink">
              <LineIcon name="trendDown" size={14} />
            </span>
            <span className="text-[13px] font-semibold text-danger-ink">รายจ่าย</span>
          </div>
          <div className="text-[18px] font-extrabold text-danger-ink">฿748,500</div>
        </div>
      </div>

      <div className="-mt-1.5 rounded-2xl bg-sky-deep p-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-line text-brand">
            <LineIcon name="barChart" size={14} />
          </span>
          <span className="text-[13px] font-semibold text-brand">กำไรสุทธิ</span>
        </div>
        <div className="text-[24px] font-extrabold text-brand">฿513,500</div>
      </div>

      <div className="flex flex-col gap-3">
        <b className="text-[15px] text-ink">สินค้าขายดี</b>
        {bestSellers.map(([name, sold, left, revenue], i) => (
          <div key={name} className="flex items-center gap-3">
            <ProductThumb name={name} rank={i + 1} tint="bg-brand-soft text-brand" />
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold">{name}</div>
              <div className="text-[12px] text-ink-muted">
                ขาย {sold} · เหลือ {left}
              </div>
            </div>
            <b className="text-[14px]">{revenue}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

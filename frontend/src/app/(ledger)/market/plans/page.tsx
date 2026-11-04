"use client";

import { ReceiptEdge } from "@/components/decor/ReceiptEdge";
import { Sticker } from "@/components/decor/Sticker";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useChoosePlan } from "@/hooks/market/useChoosePlan";
import { useSubscription } from "@/hooks/market/useSubscription";
import { formatThaiDate } from "@/lib/format";
import { useLocale } from "@/lib/i18n";

export default function PlansPage() {
  const th = useLocale();
  const t = th.marketRadar.plans;
  const FEATURES = t.features as Record<string, string>;
  const STATUS = t.statusLabel as Record<string, string>;
  const { data, error, isLoading } = useSubscription();
  const choose = useChoosePlan();

  if (error) return <Card className="border-danger-line bg-danger-soft text-sm text-danger-ink">{error.message}</Card>;
  if (isLoading || !data) return <Card className="text-center text-sm text-ink-muted">{th.myBusiness.loading}</Card>;

  const user = data.current_user;

  return (
    <div className="flex flex-col gap-[22px]">
      <h2 className="m-0 text-2xl font-bold md:text-[28px]">{t.title}</h2>
      {choose.error && <Card className="border-danger-line bg-danger-soft text-sm text-danger-ink">{choose.error.message}</Card>}

      <Card className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
        <div>
          <div className="text-xs text-ink-muted">{t.current}</div>
          <div className="font-semibold">
            {data.plans.find((p) => p.plan_id === user.plan_id)?.name ?? user.plan_id} · {user.shop_name}
          </div>
        </div>
        <div>
          <div className="text-xs text-ink-muted">{t.status}</div>
          <Badge tone={user.is_premium ? "success" : "neutral"}>{STATUS[user.status] ?? user.status}</Badge>
        </div>
        {user.next_billing_date && (
          <div>
            <div className="text-xs text-ink-muted">{t.nextBilling}</div>
            <div className="font-semibold">
              {formatThaiDate(user.next_billing_date)}
              {user.next_billing_amount_thb ? ` · ฿${user.next_billing_amount_thb}` : ""}
            </div>
          </div>
        )}
        {user.payment_method && (
          <div>
            <div className="text-xs text-ink-muted">{t.payment}</div>
            <div className="font-semibold">{user.payment_method.label}</div>
          </div>
        )}
      </Card>

      <div className="grid items-start gap-8 md:grid-cols-2">
        {data.plans.map((plan, i) => {
          const isPremium = plan.price_thb_per_month > 0;
          const isCurrent = plan.plan_id === user.plan_id;
          return (
            // drawn as a shop receipt (ใบเสร็จ), same as the home page pricing
            <div key={plan.plan_id} className={`relative drop-shadow-[0_14px_24px_rgba(20,46,34,.12)] ${i % 2 ? "md:rotate-1" : "md:-rotate-1"}`}>
              {plan.trial_days && (
                <Sticker className="absolute -right-5 -top-7 z-[1] h-24 w-24 text-sm" tilt={14}>
                  ลองฟรี
                  <br />
                  {plan.trial_days} วัน
                </Sticker>
              )}
            <section className="flex flex-col gap-4 rounded-t-2xl bg-surface px-7 pb-6 pt-7">
              <div className="text-center font-hand text-sm tracking-[0.2em] text-ink-muted">— ใบเสร็จ U-LEDGER —</div>
              <div>
                <div className={`text-[28px] font-extrabold ${isPremium ? "text-brand" : ""}`}>{plan.name}</div>
                {isPremium && <div className="text-[15px] text-ink-muted">{t.recommended}</div>}
              </div>
              <ul className="m-0 flex flex-1 list-none flex-col gap-2 border-y-2 border-dashed border-line p-0 py-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="font-bold text-brand">
                      ✓
                    </span>
                    {FEATURES[f] ?? f}
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline justify-between">
                <span className="font-hand font-bold text-ink-muted">รวม</span>
                <span className="text-[40px] font-extrabold leading-tight">
                  ฿{plan.price_thb_per_month} <span className="text-[17px] font-medium text-ink-muted">{isPremium ? t.perMonth : t.forever}</span>
                </span>
              </div>
              <button
                type="button"
                disabled={isCurrent || choose.isPending}
                onClick={() => choose.mutate(plan.plan_id)}
                className={`min-h-[48px] rounded-full px-5 font-bold disabled:cursor-default ${
                  isCurrent
                    ? "bg-line-subtle text-ink-muted"
                    : isPremium
                      ? "bg-brand text-white"
                      : "border-2 border-brand text-brand"
                }`}
              >
                {isCurrent ? t.using : t.choose}
              </button>
            </section>
              <ReceiptEdge />
            </div>
          );
        })}
      </div>
    </div>
  );
}

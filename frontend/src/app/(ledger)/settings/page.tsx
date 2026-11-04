"use client";

import Link from "next/link";
import { useState } from "react";

import { LineAddFriendButton } from "@/components/brand/LineAddFriendButton";
import { UFox } from "@/components/brand/UFox";
import { useBusiness } from "@/hooks/dashboard/useBusiness";
import { useUpdateBusiness } from "@/hooks/dashboard/useUpdateBusiness";
import { useSubscription } from "@/hooks/market/useSubscription";
import { useI18n, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { useTheme, type ThemeMode } from "@/lib/theme";
import type { BusinessInfo } from "@/types/dashboard";

const inputClass = "min-h-[48px] w-full rounded-xl border border-line bg-surface px-4 text-[15px] text-ink";

function ShopForm({ business }: { business: BusinessInfo }) {
  const update = useUpdateBusiness();
  const { tr } = useI18n();
  const [name, setName] = useState(business.name);
  const [businessType, setBusinessType] = useState(business.business_type);
  const changed = name.trim() !== business.name || businessType.trim() !== business.business_type;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        update.mutate({ name, business_type: businessType });
      }}
    >
      <label className="block">
        <span className="mb-1.5 block text-[14px] font-semibold text-ink-body">{tr("settings.shopName")}</span>
        <input required maxLength={255} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[14px] font-semibold text-ink-body">{tr("settings.businessType")}</span>
        <input
          required
          maxLength={255}
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          placeholder={tr("settings.businessTypePlaceholder")}
          className={inputClass}
        />
      </label>
      {update.error && <p className="m-0 rounded-xl bg-danger-soft px-4 py-3 text-sm text-expense">{update.error.message}</p>}
      {update.isSuccess && !changed && <p className="m-0 text-sm text-income">{tr("settings.saved")}</p>}
      <button
        type="submit"
        disabled={!changed || update.isPending || !name.trim() || !businessType.trim()}
        className="min-h-[48px] self-start rounded-full bg-brand px-7 font-bold text-white disabled:opacity-50"
      >
        {update.isPending ? tr("settings.saving") : tr("settings.save")}
      </button>
    </form>
  );
}

const LOCALES: Locale[] = ["th", "en", "zh"];
const THEME_MODES: ThemeMode[] = ["light", "dark", "system"];

export default function SettingsPage() {
  const business = useBusiness();
  const subscription = useSubscription();
  const { locale, setLocale, tr } = useI18n();
  const { mode, setMode } = useTheme();
  const plan = subscription.data?.plans.find((p) => p.plan_id === subscription.data?.current_user.plan_id);

  return (
    <div className="flex flex-col gap-5">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-deep to-brand-tint px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="m-0 text-[22px] font-bold text-ink">{tr("settings.title")}</h1>
            <p className="m-0 mt-1 text-[14px] text-ink-muted">{tr("settings.subtitle")}</p>
          </div>
          <UFox size={80} pose="proud" className="shrink-0" />
        </div>
      </section>

      <section className="rounded-[28px] bg-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <h2 className="m-0 mb-4 text-[18px] font-bold text-ink">{tr("settings.appearance")}</h2>

        <div className="flex flex-col gap-5">
          <div>
            <p className="m-0 mb-2 text-[14px] font-semibold text-ink-body">{tr("settings.language")}</p>
            <div className="flex gap-2">
              {LOCALES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={`min-h-[40px] rounded-full px-5 text-[14px] font-semibold ${
                    locale === l ? "bg-brand text-white" : "border-2 border-sky-line bg-surface text-ink-body"
                  }`}
                >
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="m-0 mb-2 text-[14px] font-semibold text-ink-body">{tr("settings.theme")}</p>
            <div className="flex gap-2">
              {THEME_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`min-h-[40px] rounded-full px-5 text-[14px] font-semibold ${
                    mode === m ? "bg-brand text-white" : "border-2 border-sky-line bg-surface text-ink-body"
                  }`}
                >
                  {m === "light" ? `☀️ ${tr("settings.themeLight")}` : m === "dark" ? `🌙 ${tr("settings.themeDark")}` : `🖥 ${tr("settings.themeSystem")}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] bg-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <h2 className="m-0 mb-4 text-[18px] font-bold text-ink">{tr("settings.shopInfo")}</h2>
        {business.error && <p className="m-0 text-expense">{tr("common.loadError")} {business.error.message}</p>}
        {business.isLoading && <p className="m-0 text-ink-muted">{tr("common.loading")}</p>}
        {business.data && <ShopForm key={business.data.name + business.data.business_type} business={business.data} />}
      </section>

      <section className="flex flex-col gap-3 rounded-[28px] bg-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <h2 className="m-0 text-[18px] font-bold text-ink">{tr("settings.tax")}</h2>
        <p className="m-0 text-ink-body">
          {tr("settings.vatStatus")}{" "}
          <b>{business.data ? (business.data.vat_registered ? tr("settings.vatRegistered") : tr("settings.vatNotRegistered")) : "…"}</b>
        </p>
        <p className="m-0 text-[14px] text-ink-muted">{tr("settings.vatReminder")}</p>
      </section>

      <section className="flex flex-col gap-3 rounded-[28px] bg-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <h2 className="m-0 text-[18px] font-bold text-ink">{tr("settings.plan")}</h2>
        <p className="m-0 text-ink-body">
          {tr("settings.currentPlan")} <b>{plan?.name ?? "…"}</b>
          {subscription.data?.current_user.status === "trialing" && tr("settings.trialing")}
        </p>
        <Link href="/market/plans" className="self-start text-[15px] font-semibold text-brand no-underline">
          {tr("settings.changePlan")}
        </Link>
      </section>

      <section className="flex flex-col gap-3 rounded-[28px] bg-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <h2 className="m-0 text-[18px] font-bold text-ink">{tr("settings.line")}</h2>
        <p className="m-0 text-[14px] text-ink-muted">{tr("settings.lineDesc")}</p>
        <LineAddFriendButton label={tr("settings.openLineChat")} className="self-start" />
      </section>
    </div>
  );
}

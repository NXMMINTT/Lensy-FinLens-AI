"use client";

import Link from "next/link";

import { LineAddFriendButton } from "@/components/brand/LineAddFriendButton";
import { UFox } from "@/components/brand/UFox";
import { useLocale } from "@/lib/i18n";

export default function HelpPage() {
  const th = useLocale();
  const h = th.help;

  return (
    <div className="flex flex-col gap-5">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-deep to-brand-tint px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="m-0 text-[22px] font-bold text-ink">{h.title}</h1>
            <p className="m-0 mt-1 text-[14px] text-ink-muted">{h.subtitle}</p>
          </div>
          <UFox size={80} pose="idea" className="shrink-0" />
        </div>
      </section>

      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {h.steps.map((s: { title: string; body: string; example?: string }, i: number) => (
          <li key={s.title} className="flex gap-4 rounded-[22px] bg-surface p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand font-bold text-white">{i + 1}</span>
            <div className="flex flex-col gap-1">
              <b className="text-ink">{s.title}</b>
              <span className="text-[15px] text-ink-body">{s.body}</span>
              {s.example && (
                <span className="self-start rounded-[14px] rounded-br-sm bg-chat px-3 py-1.5 text-[14px] text-[#0F2A12]">{s.example}</span>
              )}
            </div>
          </li>
        ))}
      </ol>

      <section className="flex flex-col gap-3 rounded-[28px] bg-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <h2 className="m-0 text-[18px] font-bold text-ink">{h.commandsTitle}</h2>
        {h.commands.map((c: { say: string; does: string }) => (
          <div key={c.say} className="flex flex-wrap items-center gap-3">
            <span className="rounded-[14px] bg-chat px-3 py-1.5 text-[14px] font-semibold text-[#0F2A12]">{c.say}</span>
            <span className="text-[15px] text-ink-body">→ {c.does}</span>
          </div>
        ))}
      </section>

      <section className="flex flex-col items-start gap-3 rounded-[28px] bg-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <h2 className="m-0 text-[18px] font-bold text-ink">{h.webEntryTitle}</h2>
        <p className="m-0 text-[15px] text-ink-body">{h.webEntryBody}</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/transactions?mode=income" className="inline-flex min-h-[44px] items-center rounded-full bg-income-solid px-5 font-bold text-white no-underline">
            {h.recordIncome}
          </Link>
          <Link href="/transactions?mode=expense" className="inline-flex min-h-[44px] items-center rounded-full bg-[#FF4081] px-5 font-bold text-white no-underline">
            {h.recordExpense}
          </Link>
        </div>
        <LineAddFriendButton label={h.addFriend} />
      </section>
    </div>
  );
}

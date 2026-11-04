/* LINE chat pieces drawn inside the landing page phone mockups (illustrations, aria-hidden by Phone). */
import { DISCLAIMER } from "@/lib/disclaimer";
import { SOURCE_LABEL, type DocSource } from "@/lib/sampleFunds";

import { LensyFace } from "./Lensy";
import { SampleBadge } from "./SampleBadge";

export function LensyChatHeader() {
  return (
    <div className="flex items-center gap-2 bg-surface px-3.5 pb-2 pt-4 text-sm font-bold">
      <LensyFace size={24} /> Lensy | FinLens AI
    </div>
  );
}

/** Messages area; newest at the bottom like LINE. */
export function ChatBody({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden p-2.5">{children}</div>;
}

export function UserMsg({ children }: { children: React.ReactNode }) {
  return <span className="max-w-[85%] shrink-0 self-end rounded-[14px] rounded-br-sm bg-chat px-3 py-1.5 text-[#0F2A12]">{children}</span>;
}

export function BotMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex max-w-[92%] shrink-0 items-end gap-1.5 self-start">
      <LensyFace size={22} />
      <span className="rounded-[14px] rounded-bl-sm bg-surface px-2.5 py-1.5">{children}</span>
    </div>
  );
}

/** Answer card (what the LINE Flex Message will look like): title, body, sample label, disclaimer. */
export function AnswerCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_2px_8px_rgba(20,46,34,.08)]">
      <div className="flex items-center justify-between gap-2 bg-brand px-3 py-2 text-white">
        <b className="text-[12.5px]">{title}</b>
      </div>
      <div className="flex flex-col gap-1.5 px-3 py-2.5">
        <SampleBadge className="self-start" />
        {children}
      </div>
      <div className="border-t border-line px-3 py-1.5 text-[10px] text-ink-muted">{DISCLAIMER}</div>
    </div>
  );
}

/** "หน้า 2 · Factsheet" source tag next to a number. */
export function PageRef({ page, source }: { page: number; source: DocSource }) {
  return (
    <span className="whitespace-nowrap text-[10px] text-ink-muted">
      หน้า {page} · {SOURCE_LABEL[source]}
    </span>
  );
}

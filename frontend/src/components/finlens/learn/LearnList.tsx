"use client";

import { useMemo, useState, type ReactNode } from "react";

import type { LearnGroup } from "@/lib/learn";

/**
 * Search box + the question accordions. Answers are rendered on the server (MiniMarkdown) and passed in
 * by question number, so this client part only filters.
 */
export function LearnList({ groups, answers }: { groups: LearnGroup[]; answers: Record<number, ReactNode> }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const shown = useMemo(
    () =>
      groups
        .map((g) => ({ ...g, items: q ? g.items.filter((it) => `${it.q} ${it.body}`.toLowerCase().includes(q)) : g.items }))
        .filter((g) => g.items.length > 0),
    [groups, q],
  );
  const total = shown.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="sticky top-[76px] z-10 flex flex-col gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-[0_8px_24px_-16px_rgb(0_0_0/0.3)] backdrop-blur">
        <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-brand">
          <span className="sr-only">ค้นหาคำถาม</span>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-ink-muted">
            <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4.2-4.2" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา เช่น ค่าธรรมเนียม ภาษี ค่าเงิน"
            className="min-h-[44px] w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-muted"
          />
        </label>
        {q ? (
          <p className="m-0 px-1 text-[14px] text-ink-muted">{total > 0 ? `พบ ${total} คำถาม` : "ไม่พบคำถามที่ตรงกัน ลองคำอื่นดูนะคะ"}</p>
        ) : (
          <nav aria-label="หมวดคำถาม" className="flex gap-1.5 overflow-x-auto pb-0.5">
            {groups.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="shrink-0 whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1 text-[14px] font-semibold text-ink-body no-underline hover:border-brand hover:text-brand"
              >
                {g.letter}. {g.title.replace(/^คำถาม(เรื่อง|ด้าน|เกี่ยวกับ)?/, "")}
              </a>
            ))}
          </nav>
        )}
      </div>

      {shown.map((g) => (
        <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="flex scroll-mt-48 flex-col gap-3">
          <h2 id={`${g.id}-title`} className="m-0 flex items-baseline gap-3 text-[22px] font-bold md:text-[26px]">
            <span className="font-heading text-brand">{g.letter}</span>
            {g.title}
            <span className="text-[14px] font-medium text-ink-muted">{g.items.length} ข้อ</span>
          </h2>
          {g.intro && !q && <p className="m-0 rounded-xl bg-sun/25 px-4 py-3 text-[15px] text-ink-body">{g.intro.replace(/\*\*/g, "")}</p>}
          <div className="flex flex-col gap-2.5">
            {g.items.map((it) => (
              <details key={it.n} id={`q${it.n}`} className="group scroll-mt-48 rounded-2xl border border-line bg-surface open:shadow-[0_6px_20px_rgba(20,46,34,.06)]">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                  <span className="w-9 shrink-0 font-heading text-[15px] text-brand/70 tabular-nums">{it.n}</span>
                  <span className="flex-1">{it.q}</span>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 md:pl-[68px]">{answers[it.n]}</div>
              </details>
            ))}
          </div>
          {g.sources && !q && <p className="m-0 text-[13.5px] text-ink-muted">แหล่งอ้างอิงหมวด {g.letter}: {g.sources}</p>}
        </section>
      ))}
    </div>
  );
}

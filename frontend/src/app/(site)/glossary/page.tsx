import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/finlens/app/AppShell";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { Disclaimer } from "@/components/finlens/Disclaimer";
import { GENERAL_NOTE } from "@/lib/ask";
import { GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "คลังศัพท์กองทุน | FinLens AI",
  description: "ศัพท์กองทุนรวมที่เจอบ่อยในเอกสาร อธิบายเป็นภาษาง่าย ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default function GlossaryPage() {
  return (
    <AppShell sampleNote={false}>
      <PageHeader
        label="คลังศัพท์กองทุน"
        badge={<span className="rounded-md bg-sky px-2 py-0.5 text-[13px] text-ink-muted">{GENERAL_NOTE}</span>}
        title="ศัพท์ในเอกสารกองทุน"
        mark="แบบเข้าใจง่าย"
        text="คำที่เจอบ่อยใน Factsheet และหนังสือชี้ชวน ยังไม่เข้าใจตรงไหน กด “ถามน้องต่อ” ได้เลยค่ะ"
        pose="question"
      />

      {/* jump list */}
      <nav aria-label="หมวดศัพท์" className="flex flex-wrap gap-2">
        {GLOSSARY.map((g, i) => (
          <a key={g.title} href={`#group-${i}`} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[14px] font-semibold text-ink-body no-underline hover:border-brand">
            {g.title}
          </a>
        ))}
      </nav>

      {GLOSSARY.map((g, i) => (
        <section key={g.title} id={`group-${i}`} aria-labelledby={`group-${i}-title`} className="flex scroll-mt-24 flex-col gap-3">
          <h2 id={`group-${i}-title`} className="m-0 text-[22px] font-bold">
            {g.title}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {g.terms.map((t) => (
              <article key={t.id} id={t.id} className="flex scroll-mt-24 flex-col gap-2 rounded-[20px] border border-line bg-surface p-5">
                <h3 className="m-0 flex flex-wrap items-baseline gap-x-2 text-[18px] font-bold">
                  {t.term}
                  {t.en && <span className="text-[13.5px] font-medium text-ink-muted">({t.en})</span>}
                </h3>
                <p className="m-0 text-[15.5px] text-ink-body">{t.text}</p>
                {t.tip && (
                  <p className="m-0 rounded-xl bg-brand-tint px-3 py-2 text-[14px] text-ink-body">
                    <b className="text-brand">ควรรู้:</b> {t.tip}
                  </p>
                )}
                <Link href={`/chat?q=${encodeURIComponent(t.ask)}`} className="mt-auto self-start text-[14px] font-bold text-brand underline-offset-4 hover:underline">
                  ถามน้องต่อ →
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}

      <Disclaimer />
    </AppShell>
  );
}

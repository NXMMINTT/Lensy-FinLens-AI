import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { GENERAL_NOTE } from "@/lib/ask";
import { GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "คลังศัพท์กองทุน | FinLens AI",
  description: "ศัพท์กองทุนรวมที่เจอบ่อยในเอกสาร อธิบายเป็นภาษาง่าย ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

/** "การเติบโตโดยรวม: ..." tips get that label; any other tip is "ควรรู้". */
function tipParts(tip: string): [label: string, text: string] {
  const growth = "การเติบโตโดยรวม:";
  return tip.startsWith(growth) ? ["การเติบโตโดยรวม", tip.slice(growth.length).trim()] : ["ควรรู้", tip];
}

/** A dictionary to read: one column, each group a heading, each term with its meaning and a short tip. */
export default function GlossaryPage() {
  return (
    <AppShell sampleNote={false}>
      <PageHeader
        label="คลังศัพท์กองทุน"
        title="ศัพท์ในเอกสารกองทุน"
        mark="แบบเข้าใจง่าย"
        text="คำที่เจอบ่อยใน Factsheet และหนังสือชี้ชวน อธิบายเป็นภาษาง่าย ๆ อ่านเรียงไปหรือข้ามไปหมวดที่สงสัยได้เลยค่ะ"
        pose="question"
      />

      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-10">
        <nav aria-labelledby="glossary-toc" className="border-b border-line pb-6">
          <h2 id="glossary-toc" className="m-0 mb-3 text-[14px] font-bold tracking-wide text-ink-muted">
            หมวด
          </h2>
          <ol className="m-0 grid list-none gap-x-8 gap-y-1 p-0 sm:grid-cols-2">
            {GLOSSARY.map((g, i) => (
              <li key={g.title}>
                <a href={`#group-${i}`} className="group flex items-baseline gap-3 py-1.5 no-underline">
                  <span className="w-5 shrink-0 text-[13px] font-semibold text-ink-faint tabular-nums">{i + 1}</span>
                  <span className="flex-1 text-[16px] font-semibold text-ink group-hover:text-brand">{g.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {GLOSSARY.map((g, i) => (
          <section key={g.title} id={`group-${i}`} aria-labelledby={`group-${i}-title`} className="flex scroll-mt-24 flex-col">
            <h2 id={`group-${i}-title`} className="m-0 flex items-baseline gap-3 border-b-2 border-brand/20 pb-3 text-[24px] font-bold md:text-[28px]">
              <span className="text-brand/60 tabular-nums">{i + 1}</span>
              {g.title}
            </h2>
            <dl className="m-0">
              {g.terms.map((t) => (
                <div key={t.id} id={t.id} className="scroll-mt-24 border-b border-line-subtle py-6 last:border-0">
                  <dt className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                    <span className="text-[20px] font-bold leading-snug text-ink">{t.term}</span>
                    {t.en && <span className="text-[14px] text-ink-muted">{t.en}</span>}
                  </dt>
                  <dd className="m-0 mt-2 flex flex-col gap-2.5">
                    <p className="m-0 text-[16.5px] leading-[1.8] text-ink-body">{t.text}</p>
                    {t.tip &&
                      (() => {
                        const [label, text] = tipParts(t.tip);
                        return (
                          <p className="m-0 text-[15px] leading-relaxed text-ink-muted">
                            <span className="font-bold text-brand">{label}</span> · {text}
                          </p>
                        );
                      })()}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <div className="flex flex-col gap-3 border-t border-line pt-6">
          <p className="m-0 text-[14px] text-ink-muted">{GENERAL_NOTE}</p>
        </div>
      </div>
    </AppShell>
  );
}

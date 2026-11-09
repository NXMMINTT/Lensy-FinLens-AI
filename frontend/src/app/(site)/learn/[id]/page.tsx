import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LandingHeader } from "@/components/finlens/LandingHeader";
import { LandingFooter } from "@/components/finlens/LandingSections";
import { MiniMarkdown } from "@/components/finlens/learn/MiniMarkdown";
import { GENERAL_NOTE } from "@/lib/ask";
import { chapterTitle, LEARN, learnGroup } from "@/lib/learn";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return LEARN.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = learnGroup((await params).id);
  return { title: g ? `${chapterTitle(g)} | คำถามที่ควรรู้ก่อนลงทุน | FinLens AI` : "ไม่พบบทนี้ | FinLens AI" };
}

/** One chapter, read like a book: every question as a heading with its answer open under it. */
export default async function LearnChapterPage({ params }: Props) {
  const g = learnGroup((await params).id);
  if (!g) notFound();
  const i = LEARN.indexOf(g);
  const prev = LEARN[i - 1];
  const next = LEARN[i + 1];

  return (
    <div className="overflow-x-clip text-ink">
      <LandingHeader />
      <main className="bg-surface">
        <article className="mx-auto flex max-w-[720px] flex-col px-5 py-12 md:px-6 md:py-16">
          <nav aria-label="breadcrumb" className="text-[14px] text-ink-muted">
            <Link href="/learn" className="text-ink-muted no-underline hover:text-brand">
              ← สารบัญ
            </Link>
          </nav>

          <header className="mt-8 flex flex-col gap-3 border-b border-line pb-8">
            <span className="text-[14px] font-bold tracking-wide text-brand">
              บทที่ {i + 1} จาก {LEARN.length}
            </span>
            <h1 className="m-0 text-[32px] font-bold leading-tight md:text-[42px]">{chapterTitle(g)}</h1>
            {g.intro && <MiniMarkdown text={g.intro} className="gap-3 text-[17px] leading-relaxed" />}
          </header>

          <div className="flex flex-col">
            {g.items.map((it) => (
              <section key={it.n} id={`q${it.n}`} className="scroll-mt-24 border-b border-line-subtle py-9 last:border-0">
                <h2 className="m-0 flex gap-3 text-[21px] font-bold leading-snug md:text-[23px]">
                  <span className="shrink-0 text-brand/60 tabular-nums">{it.n}.</span>
                  <span>{it.q}</span>
                </h2>
                <div className="mt-4">
                  <MiniMarkdown text={it.body} className="gap-4 text-[17px] leading-[1.85]" />
                </div>
              </section>
            ))}
          </div>

          {g.sources && <p className="m-0 mt-4 text-[14px] leading-relaxed text-ink-muted">แหล่งอ้างอิงบทนี้: {g.sources}</p>}

          <nav aria-label="บทอื่น" className="mt-12 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
            {prev ? (
              <Link href={`/learn/${prev.id}`} className="flex flex-col gap-1 rounded-2xl border border-line p-4 no-underline hover:border-brand">
                <span className="text-[13px] text-ink-muted">← บทก่อนหน้า</span>
                <b className="text-[16px] text-ink">{chapterTitle(prev)}</b>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/learn/${next.id}`} className="flex flex-col items-end gap-1 rounded-2xl border border-line p-4 text-right no-underline hover:border-brand">
                <span className="text-[13px] text-ink-muted">บทถัดไป →</span>
                <b className="text-[16px] text-ink">{chapterTitle(next)}</b>
              </Link>
            )}
          </nav>

          <div className="mt-10 flex flex-col gap-3">
            <p className="m-0 text-[14px] text-ink-muted">
              {GENERAL_NOTE} ตัวเลขในคำตอบเป็นตัวอย่างสมมติเพื่ออธิบายหลักการ ส่วนกฎหมายและภาษีอาจเปลี่ยนแปลงได้ ควรตรวจประกาศฉบับล่าสุดก่อนตัดสินใจ
            </p>
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/finlens/app/AppShell";
import { Card } from "@/components/finlens/app/ui";
import { Icon } from "@/components/finlens/Icon";
import { Lensy } from "@/components/finlens/Lensy";
import { RefStatusBadge } from "@/components/finlens/reference/RefCard";
import { Linked, SourceList } from "@/components/finlens/reference/RefItem";
import { FIGURES_HELD_BACK, REFERENCE, REFERENCE_ACCESSED, refCategory, refFromSlug, refHref, refSlug, shownFacts, shownNote } from "@/lib/reference";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return REFERENCE.flatMap((c) => c.items.filter((i) => i.status !== "unchecked").map((i) => ({ id: refSlug(i.id) })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const it = refFromSlug((await params).id);
  return { title: it ? `${it.title} | FinLens AI` : "ไม่พบหัวข้อ | FinLens AI" };
}

/** Same frame as the fund page: header, figures card on the left, risks and how-to-check on the right, sources last. */
export default async function ReferencePage({ params }: Props) {
  const item = refFromSlug((await params).id);
  if (!item || item.status === "unchecked") notFound();
  const cat = refCategory(item.id)!;
  const i = cat.items.findIndex((x) => x.id === item.id);
  const prev = cat.items.slice(0, i).reverse().find((x) => x.status !== "unchecked");
  const next = cat.items.slice(i + 1).find((x) => x.status !== "unchecked");
  const ask = `อธิบายเรื่อง ${item.title} ให้เข้าใจง่าย ๆ หน่อย`;

  return (
    <AppShell>
      <nav aria-label="breadcrumb" className="text-[14px] text-ink-muted">
        <Link href="/explain" className="text-ink-muted no-underline hover:text-brand">
          ดูทีละกอง
        </Link>{" "}
        / {cat.num}. {cat.title} / <span className="text-ink-body">{item.id}</span>
      </nav>

      {/* header */}
      <header className="flex flex-wrap items-start justify-between gap-5 rounded-[28px] border border-line bg-surface p-5 md:p-7">
        <div className="flex min-w-0 max-w-[700px] flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-muted">
            <span className="rounded-full bg-sky px-2.5 py-0.5 text-[12px] font-bold tracking-wide text-ink-body">{item.id}</span>
            <span>
              หมวด {cat.num} {cat.title}
            </span>
          </div>
          <h1 className="m-0 text-[28px] font-bold leading-tight md:text-[36px]">{item.title}</h1>
          {item.what && (
            <p className="m-0 text-ink-body">
              <Linked text={item.what} />
            </p>
          )}
          <div className="mt-1">
            <RefStatusBadge status={item.status} />
          </div>
        </div>
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
          <Link
            href={`/chat?q=${encodeURIComponent(ask)}`}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-brand px-5 font-bold text-white no-underline hover:bg-brand-dark"
          >
            ถามน้อง Lensy เรื่องนี้
          </Link>
          <Link
            href="/explain"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-brand px-5 font-bold text-brand no-underline hover:bg-brand-soft"
          >
            ดูหัวข้ออื่น
          </Link>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* latest figures */}
        <Card id="facts">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[13px] font-bold uppercase tracking-wider text-brand">Latest Figures</span>
              <h2 className="m-0 text-[22px] font-bold">ตัวเลขล่าสุด</h2>
            </div>
            <Lensy pose="magnifier" size={64} />
          </div>

          {item.showFigures && item.headline && (
            <div className="mt-4 rounded-2xl bg-brand-tint p-4">
              <div className="text-[14px] text-ink-muted">{item.headline.label}</div>
              <div className="font-heading text-[44px] font-bold leading-none text-brand">{item.headline.value}</div>
              {item.asOf && <p className="m-0 mt-2 text-[13.5px] text-ink-muted">ข้อมูล ณ {item.asOf}</p>}
            </div>
          )}

          {/* the audit holds some topics' figures back: say so instead of showing them */}
          {!item.showFigures && (
            <p className="m-0 mt-4 flex items-start gap-2 rounded-2xl border border-line bg-sky/60 p-3.5 text-[14.5px] text-ink-body">
              <Icon name="info" className="mt-0.5 shrink-0" />
              {FIGURES_HELD_BACK}
            </p>
          )}

          <h3 className="m-0 mt-5 text-[16px] font-bold">{item.showFigures ? "ตัวเลขทุกรายการ" : "ข้อเท็จจริงที่แสดงได้"}</h3>
          <ul className="m-0 mt-2 flex list-none flex-col p-0">
            {shownFacts(item).length === 0 && <li className="py-2.5 text-[14.5px] text-ink-muted">ยังไม่มีข้อเท็จจริงที่แสดงได้ในรอบนี้</li>}
            {shownFacts(item).map((t) => (
              <li key={t} className="border-b border-line-subtle py-2.5 text-[14.5px] text-ink-body last:border-0">
                <Linked text={t} />
              </li>
            ))}
          </ul>
          {!(item.showFigures && item.headline) && item.asOf && <p className="m-0 mt-2 text-[13.5px] text-ink-muted">ข้อมูล ณ {item.asOf}</p>}

          {shownNote(item) && (
            <p className="m-0 mt-3 rounded-xl bg-sun-soft px-3 py-2 text-[14px] text-sun-ink">
              <b>
                <Icon name="warn" className="mr-1" />
                หมายเหตุ:
              </b>{" "}
              <Linked text={shownNote(item)} />
            </p>
          )}
          {item.law && (
            <p className="m-0 mt-3 text-[13.5px] text-ink-muted">
              <b className="text-ink-body">กฎหมายที่เกี่ยวข้อง:</b> {item.law}
              {item.checkedOn && <> · ตรวจข้อมูลเมื่อ {thaiDate(item.checkedOn)}</>}
            </p>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          {/* risks */}
          <Card id="risks">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[13px] font-bold uppercase tracking-wider text-brand">Risk Alert</span>
                <h2 className="m-0 text-[22px] font-bold">ความเสี่ยงที่ควรรู้</h2>
              </div>
              <Lensy pose="checklist" size={64} />
            </div>
            {item.risk ? (
              <p className="m-0 mt-3 rounded-2xl border border-line p-3.5 text-[15px] text-ink-body">
                <Linked text={item.risk} />
              </p>
            ) : (
              <p className="m-0 mt-3 text-ink-muted">ยังไม่มีข้อมูลความเสี่ยงในรอบนี้</p>
            )}
          </Card>

          {/* how to check */}
          <Card id="check">
            <h2 className="m-0 text-[20px] font-bold">ตรวจเองได้อย่างไร</h2>
            <ol className="m-0 mt-2 flex list-none flex-col p-0">
              {item.check.map((t, n) => (
                <li key={t} className="flex gap-3 border-b border-line-subtle py-2.5 text-[14.5px] text-ink-body last:border-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12px] font-bold text-brand">{n + 1}</span>
                  <span>
                    <Linked text={t} />
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      {/* prev / next in the same group */}
      {(prev || next) && (
        <nav aria-label="หัวข้ออื่นในหมวดเดียวกัน" className="flex flex-wrap justify-between gap-3">
          {prev ? (
            <Link href={refHref(prev.id)} className="rounded-full border border-line bg-surface px-4 py-2 font-semibold text-ink-body no-underline hover:border-brand hover:text-brand">
              ← {prev.id} {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={refHref(next.id)} className="rounded-full border border-line bg-surface px-4 py-2 font-semibold text-ink-body no-underline hover:border-brand hover:text-brand">
              {next.id} {next.title} →
            </Link>
          )}
        </nav>
      )}

      {/* sources */}
      <Card>
        <h2 className="m-0 text-[17px] font-bold">ที่มาของข้อมูล</h2>
        <div className="mt-2">
          <SourceList sources={item.sources} />
        </div>
        <p className="m-0 mt-3 text-[14px] text-ink-muted">
          ตารางอ้างอิงการลงทุน รอบที่ 1 ค้นเมื่อ {REFERENCE_ACCESSED} ตัวเลขมาจากข้อความในผลค้นหา ยังไม่ได้เปิดอ่านเอกสารต้นฉบับเต็มทุกแหล่ง ควรกดลิงก์ตรวจซ้ำก่อนใช้
        </p>
      </Card>
    </AppShell>
  );
}

const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

/** "2026-11-10" -> "10 พ.ย. 2569" */
function thaiDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${Number(m[3])} ${TH_MONTHS[Number(m[2]) - 1]} ${Number(m[1]) + 543}` : iso;
}

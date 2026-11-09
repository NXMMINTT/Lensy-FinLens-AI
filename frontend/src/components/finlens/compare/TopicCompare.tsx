"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { MAX_COMPARE_FUNDS } from "@/lib/limits";
import { refPath, shortAsOf, type RefCompareData } from "@/lib/referenceShared";

import { RefStatusBadge } from "../reference/RefCard";

const MAX = MAX_COMPARE_FUNDS;

/**
 * Compare up to MAX topics of one reference group side by side: the headline figure first, then what
 * it is, every figure, the date, risks, status and how many sources. The group is chosen in the nav
 * on the compare page; this part only picks topics and draws the table.
 */
export function TopicCompare({ catNum, catTitle, items, initialIds }: { catNum: number; catTitle: string; items: RefCompareData[]; initialIds: string[] }) {
  const [picked, setPicked] = useState<string[]>(initialIds);
  const [started, setStarted] = useState(initialIds.length >= 2);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const chosen = picked.map((id) => byId.get(id)).filter((x): x is RefCompareData => x !== undefined);
  const show = started && chosen.length >= 2;

  function toggle(id: string) {
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX ? cur : [...cur, id]));
  }

  // keep the URL shareable without a reload
  useEffect(() => {
    if (!started) return;
    const url = new URL(window.location.href);
    url.searchParams.set("cat", String(catNum));
    url.searchParams.set("topics", picked.join(","));
    url.searchParams.delete("funds");
    window.history.replaceState(null, "", url);
  }, [picked, started, catNum]);

  const rows: { label: string; render: (t: RefCompareData) => React.ReactNode }[] = [
    { label: "คืออะไร", render: (t) => t.what || <span className="text-ink-muted">ยังไม่มีข้อมูล</span> },
    {
      label: "ตัวเลขทุกรายการ",
      render: (t) =>
        t.facts.length ? (
          <ul className="m-0 flex flex-col gap-1 pl-4">
            {t.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        ) : (
          <span className="text-ink-muted">ยังไม่มีตัวเลข</span>
        ),
    },
    { label: "ข้อมูล ณ วันที่", render: (t) => t.asOf || <span className="text-ink-muted">ไม่ระบุ</span> },
    { label: "ความเสี่ยงที่ควรรู้", render: (t) => t.risk || <span className="text-ink-muted">ยังไม่มีข้อมูล</span> },
    { label: "สถานะการตรวจสอบ", render: (t) => <RefStatusBadge status={t.status} /> },
    {
      label: "แหล่งที่มา",
      render: (t) => (
        <Link href={refPath(t.id, t.status)} className="font-semibold text-brand underline-offset-4 hover:underline">
          {t.sourceCount} แหล่ง · ดูรายละเอียด →
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="pick-topic-title" className="rounded-[24px] border border-line bg-surface p-5 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="pick-topic-title" className="m-0 text-[20px] font-bold">
            เลือกหัวข้อในหมวด {catTitle} ที่จะเทียบ
          </h2>
          <span className="text-[13px] text-ink-muted">
            เลือกได้ {MAX} หัวข้อ · เลือกแล้ว {chosen.length}
          </span>
        </div>
        <ul className="m-0 mt-4 grid list-none gap-1 rounded-2xl border border-line p-2 sm:grid-cols-2">
          {items.map((t) => {
            const n = picked.indexOf(t.id);
            const sel = n >= 0;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => toggle(t.id)}
                  aria-pressed={sel}
                  disabled={!sel && picked.length >= MAX}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${sel ? "bg-brand-soft" : "hover:bg-line-subtle"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${sel ? "border-brand bg-brand text-white" : "border-line"}`}
                  >
                    {sel ? n + 1 : ""}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[14.5px] font-semibold text-ink">{t.title}</span>
                    <span className="truncate text-[12.5px] text-ink-muted">
                      {t.id}
                      {t.headline ? ` · ${t.headline.value} ${t.headline.label}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {!started && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setStarted(true)}
              disabled={chosen.length < 2}
              className="inline-flex min-h-[50px] items-center rounded-full bg-brand px-8 text-[16px] font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              เทียบเลย
            </button>
            {chosen.length < 2 && <span className="text-[14px] text-ink-muted">เลือกอย่างน้อย 2 หัวข้อจากรายการด้านบนก่อนนะคะ</span>}
          </div>
        )}
      </section>

      {show && (
        <section aria-labelledby="topic-table-title" className="rounded-[24px] border border-line bg-surface">
          <div className="flex flex-col gap-1 px-5 pt-5 md:px-6">
            <h2 id="topic-table-title" className="m-0 text-[18px] font-bold">
              เทียบหัวข้อ: {catTitle}
            </h2>
            <p className="m-0 text-[13.5px] text-ink-muted">ตัวเลขมาจากผลค้นหา (ตารางอ้างอิงรอบที่ 1) ดูป้ายสถานะและวันที่ของแต่ละหัวข้อก่อนเทียบ ตัวเลขต่างวันกันอาจเทียบกันตรง ๆ ไม่ได้</p>
          </div>
          <div className="overflow-x-auto px-3 pb-3 pt-3 md:px-4">
            <table className="w-full min-w-[620px] table-fixed border-collapse overflow-hidden rounded-2xl text-left text-[14.5px]">
              <colgroup>
                <col className="w-[22%]" />
                {chosen.map((t) => (
                  <col key={t.id} />
                ))}
              </colgroup>
              <thead>
                <tr className="bg-brand-dark text-white">
                  <th className="p-3" aria-label="รายการ" />
                  {chosen.map((t, n) => (
                    <th key={t.id} className="p-3 align-top font-normal">
                      <span className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-[15px] font-bold">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px]">{n + 1}</span>
                          {t.id}
                        </span>
                        <span className="line-clamp-2 text-[13px] leading-snug text-white/85">{t.title}</span>
                      </span>
                    </th>
                  ))}
                </tr>
                {/* the number that matters, first */}
                <tr className="border-b-2 border-brand/20 bg-brand-soft">
                  <th scope="row" className="p-3 text-left font-bold text-ink">
                    ตัวเลขล่าสุด
                  </th>
                  {chosen.map((t) => (
                    <td key={t.id} className="p-3 align-top">
                      {t.headline ? (
                        <span className="flex flex-col gap-0.5">
                          <b className="text-[22px] leading-tight text-brand">{t.headline.value}</b>
                          <span className="text-[12.5px] text-ink-body">{t.headline.label}</span>
                          {t.asOf && <span className="text-[12px] text-ink-muted">ณ {shortAsOf(t.asOf)}</span>}
                        </span>
                      ) : (
                        <span className="text-[13px] text-ink-muted">ไม่มีตัวเลขเด่น ดูรายการด้านล่าง</span>
                      )}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-line-subtle last:border-0">
                    <th scope="row" className="bg-line-subtle/50 p-3 align-top text-[14px] font-semibold text-ink-body">
                      {r.label}
                    </th>
                    {chosen.map((t) => (
                      <td key={t.id} className="p-3 align-top text-ink-body">
                        {r.render(t)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

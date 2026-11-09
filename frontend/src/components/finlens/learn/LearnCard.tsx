import Link from "next/link";

import { chapterTitle, LEARN } from "@/lib/learn";

import { LensyFace } from "../Lensy";

/**
 * "คำถามที่ควรรู้ก่อนลงทุน": the question groups of /learn as chips (each opens its group) and a
 * button to the whole list. Used on the home page (tall, in a grid) and the menu page (wide).
 */
export function LearnCard({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={`flex gap-4 rounded-[20px] bg-gradient-to-br from-brand-soft to-surface p-5 ${
        wide ? "flex-col md:flex-row md:items-center md:gap-6" : "flex-col gap-3"
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <LensyFace size={36} />
          <h3 className="m-0 text-[19px] font-bold leading-snug">คำถามที่ควรรู้ก่อนลงทุน</h3>
        </div>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {LEARN.map((g) => (
            <li key={g.id}>
              <Link
                href={`/learn/${g.id}`}
                className="inline-flex rounded-full border border-line bg-surface px-2.5 py-1 text-[13.5px] text-ink-body no-underline hover:border-brand hover:text-brand"
              >
                {chapterTitle(g)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Link
        href="/learn"
        className={`inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-brand px-6 font-bold text-white no-underline hover:bg-brand-dark ${wide ? "" : "mt-auto"}`}
      >
        ดูทั้งหมด
      </Link>
    </div>
  );
}

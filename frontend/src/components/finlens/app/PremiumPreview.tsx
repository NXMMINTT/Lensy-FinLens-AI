import Link from "next/link";

/**
 * Body of a Premium page that is not built yet: what it will do, in steps, and what Lensy still
 * won't do. No figures, so nothing here can be mistaken for real fund data.
 */
export function PremiumPreview({ steps, shows, promise }: { steps: string[]; shows: string[]; promise: string }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="m-0 rounded-2xl border border-sun/50 bg-sun-soft px-5 py-3 text-[15px] text-sun-ink">
        ฟีเจอร์นี้อยู่ในแผน Premium ช่วงเดโมยังไม่เปิดใช้งาน หน้านี้อธิบายว่าจะทำงานอย่างไร
      </p>

      <section aria-labelledby="steps-title" className="rounded-[24px] border border-line bg-surface p-5 md:p-6">
        <h2 id="steps-title" className="m-0 text-[20px] font-bold">
          ทำงานอย่างไร
        </h2>
        <ol className="m-0 mt-4 grid list-none gap-3 p-0 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-col gap-2 rounded-2xl bg-brand-tint p-4">
              <span className="font-heading text-[30px] font-bold leading-none text-brand/40">0{i + 1}</span>
              <span className="text-[15.5px] text-ink-body">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="shows-title" className="rounded-[24px] border border-line bg-surface p-5 md:p-6">
        <h2 id="shows-title" className="m-0 text-[20px] font-bold">
          สิ่งที่จะได้เห็น
        </h2>
        <ul className="m-0 mt-3 flex flex-col gap-2 p-0">
          {shows.map((s) => (
            <li key={s} className="flex items-start gap-2.5 text-[15.5px] text-ink-body">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white" aria-hidden="true">
                ✓
              </span>
              {s}
            </li>
          ))}
        </ul>
        <p className="m-0 mt-4 border-t border-line pt-3 text-[14px] text-ink-muted">{promise}</p>
      </section>

      <Link
        href="/premium"
        className="self-start rounded-full bg-brand px-6 py-3 font-bold text-white no-underline hover:bg-brand-dark"
      >
        ดูแผน Premium
      </Link>
    </div>
  );
}

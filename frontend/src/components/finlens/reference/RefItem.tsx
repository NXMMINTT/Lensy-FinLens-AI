import Link from "next/link";

import { refHref, type RefSource } from "@/lib/reference";

/** Text with "ดูหัวข้อ 1.6" / "ดู 2.11" turned into links to that topic. */
export function Linked({ text }: { text: string }) {
  const parts = text.split(/(ดู(?:หัวข้อ)? \d+\.\d+)/);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^ดู(?:หัวข้อ)? (\d+\.\d+)$/);
        return m ? (
          <Link key={i} href={refHref(m[1])} className="font-semibold text-brand underline-offset-4 hover:underline">
            ดูหัวข้อ {m[1]}
          </Link>
        ) : (
          p
        );
      })}
    </>
  );
}

/** A topic's sources: name as a link (when there is one) and how official the source is. */
export function SourceList({ sources }: { sources: RefSource[] }) {
  return (
    <ul className="m-0 flex flex-col gap-1.5 pl-5 text-[14.5px] text-ink-body">
      {sources.map((s) => (
        <li key={s.key} className="break-words">
          {s.url ? (
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand underline-offset-4 hover:underline">
              {s.name}
            </a>
          ) : (
            s.name
          )}
          {s.tier && <span className="text-[12.5px] text-ink-muted"> · {s.tier}</span>}
        </li>
      ))}
    </ul>
  );
}

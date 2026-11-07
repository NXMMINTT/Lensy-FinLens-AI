import type { ReactNode } from "react";

/** **bold** inside a line. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <b key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </b>
    ) : (
      part
    ),
  );
}

const cells = (row: string) => row.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

/** The small Markdown subset used in lib/learn-data.json (see lib/learn.ts). */
export function MiniMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const key = out.length;
    if (!line.trim()) {
      i++;
    } else if (line.startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
      const [head, , ...body] = rows;
      out.push(
        <div key={key} className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full border-collapse text-[14.5px]">
            <thead className="bg-brand-tint">
              <tr>
                {cells(head).map((c) => (
                  <th key={c} className="px-3 py-2 text-left font-semibold text-ink">
                    {inline(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className="border-t border-line">
                  {cells(r).map((c, ci) => (
                    <td key={ci} className="px-3 py-2 align-top text-ink-body">
                      {inline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    } else if (/^- /.test(line) || /^\d+\. /.test(line)) {
      const ordered = /^\d+\. /.test(line);
      const items: string[] = [];
      while (i < lines.length && (ordered ? /^\d+\. /.test(lines[i]) : /^- /.test(lines[i]))) items.push(lines[i++].replace(/^(- |\d+\. )/, ""));
      const List = ordered ? "ol" : "ul";
      out.push(
        <List key={key} className={`m-0 flex flex-col gap-1 pl-5 text-ink-body ${ordered ? "list-decimal" : "list-disc"} marker:text-brand`}>
          {items.map((it, ii) => (
            <li key={ii}>{inline(it)}</li>
          ))}
        </List>,
      );
    } else if (line.startsWith("> ")) {
      out.push(
        <blockquote key={key} className="m-0 border-l-4 border-brand/40 pl-3 text-ink-body">
          {inline(line.slice(2))}
        </blockquote>,
      );
      i++;
    } else if (line.startsWith("$$ ")) {
      out.push(
        <p key={key} className="m-0 self-start rounded-lg bg-brand-tint px-3 py-1.5 font-semibold tabular-nums text-ink">
          {line.slice(3)}
        </p>,
      );
      i++;
    } else {
      out.push(
        <p key={key} className="m-0 text-ink-body">
          {inline(line)}
        </p>,
      );
      i++;
    }
  }
  return <div className="flex flex-col gap-3 text-[15.5px]">{out}</div>;
}

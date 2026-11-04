/** Endless strip of things people actually type to U-Fox. */
export function ChatMarquee({ items }: { items: readonly string[] }) {
  const row = [...items, ...items];
  return (
    <div className="group relative overflow-hidden py-2" aria-label={`ตัวอย่างข้อความ: ${items.join(", ")}`}>
      <div className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused]" aria-hidden="true">
        {row.map((t, i) => (
          <span
            key={i}
            className={`whitespace-nowrap rounded-2xl px-4 py-2 text-[15px] ${i % 3 === 1 ? "rounded-bl-sm bg-surface text-ink" : "rounded-br-sm bg-chat text-[#0F2A12]"}`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

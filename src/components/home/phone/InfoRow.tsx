export function InfoRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-ink-muted">{k}</span>
      <b>{v}</b>
    </div>
  );
}

/* ── sections ── */

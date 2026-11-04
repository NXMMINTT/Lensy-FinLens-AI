/** Tiny trend line for cards; the card's text carries the actual number. */
export function Sparkline({ values, width = 160, height = 40 }: { values: number[]; width?: number; height?: number }) {
  const lo = Math.min(...values);
  const span = Math.max(...values) - lo || 1;
  const points = values
    .map(
      (v, i) =>
        `${(4 + ((width - 8) * i) / (values.length - 1)).toFixed(1)},${(height - 4 - ((height - 8) * (v - lo)) / span).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="#1F5FBF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

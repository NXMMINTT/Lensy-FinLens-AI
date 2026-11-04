/** Zig-zag bottom edge so a card reads as a torn-off receipt. */
export function ReceiptEdge({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <svg viewBox="0 0 120 10" preserveAspectRatio="none" className="block h-3 w-full" aria-hidden="true">
      <path d="M0 0h120v2l-5 8-5-8-5 8-5-8-5 8-5-8-5 8-5-8-5 8-5-8-5 8-5-8-5 8-5-8-5 8-5-8-5 8-5-8-5 8-5-8-5 8-5-8-5 8-5-8-5 8z" fill={color} />
    </svg>
  );
}

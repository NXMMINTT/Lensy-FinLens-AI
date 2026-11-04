import { categoryIconKind, type CategoryIconKind } from "@/lib/categoryIconKind";

const PATHS: Record<CategoryIconKind, React.ReactNode> = {
  bag: (
    <>
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  store: (
    <>
      <path d="M4 9l1.5-5h13L20 9" />
      <path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9" />
      <path d="M5 11v9h14v-9M10 20v-5h4v5" />
    </>
  ),
  box: (
    <>
      <path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5v-9z" />
      <path d="M3.5 7.5L12 12l8.5-4.5M12 12v9" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 9.5V20h12V9.5M10 20v-6h4v6" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 17h6M10 20h4" />
      <path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.9.8-1.5 1.5-1.5 2.5h-4c0-1-.6-1.7-1.5-2.5z" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 10v4h3l8 4V6L7 10H4z" />
      <path d="M18 9.5a3.5 3.5 0 0 1 0 5M8 14l1 5h2.5l-1-4.5" />
    </>
  ),
  food: (
    <>
      <path d="M4 12h16a8 8 0 0 1-16 0z" />
      <path d="M9 8c0-1.5 1-1.5 1-3M14 8c0-1.5 1-1.5 1-3" />
    </>
  ),
  drink: (
    <>
      <path d="M6 7h12l-1.5 13h-9L6 7z" />
      <path d="M12 7l2-4M6.5 11h11" />
    </>
  ),
  fuel: (
    <>
      <path d="M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M3.5 20h12M6.5 8h6" />
      <path d="M14 10h2a1.5 1.5 0 0 1 1.5 1.5V16a1.5 1.5 0 0 0 3 0V9l-2.5-2.5" />
    </>
  ),
  other: (
    <>
      <circle cx="6" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="18" cy="12" r="1.3" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9-8-8z" />
      <circle cx="8" cy="8" r="1.4" />
    </>
  ),
};

/** Line icon for an income/expense category name; draws in the current text color. */
export function CategoryLineIcon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {PATHS[categoryIconKind(name)]}
    </svg>
  );
}

import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[28px] bg-surface p-6 md:p-7 ${className}`}>{children}</div>;
}

import type { Metadata } from "next";

import { LiffStateHandler } from "@/components/LiffStateHandler";
import { ThemeProvider } from "@/lib/theme";

import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "FinLens AI — ผู้ช่วยการเงินที่ทำให้เห็นค่าใช้จ่ายที่มองไม่เห็น",
  description: "FinLens AI — ผู้ช่วยการเงินที่ทำให้เห็นค่าใช้จ่ายที่มองไม่เห็น",
};

/** Root layout for every page of the site. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${fontVariables} scroll-smooth`} suppressHydrationWarning>
      <body className="font-sans text-[17px] leading-relaxed">
        <ThemeProvider>
          <LiffStateHandler />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

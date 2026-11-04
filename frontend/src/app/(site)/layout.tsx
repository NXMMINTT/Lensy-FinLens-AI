import type { Metadata } from "next";

import { LiffStateHandler } from "@/components/LiffStateHandler";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "FinLens AI — เข้าใจกองทุนรวมก่อนตัดสินใจ กับน้อง Lensy",
  description: "น้อง Lensy อ่าน Fund Factsheet และหนังสือชี้ชวนให้ บอกค่าใช้จ่าย ต้นทุนเป็นบาท และความเสี่ยง พร้อมเลขหน้าที่มา ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

/** Root layout for the public home page. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${fontVariables} scroll-smooth`} suppressHydrationWarning>
      <body className="font-sans text-[17px] leading-relaxed">
        <ThemeProvider>
          <I18nProvider>
            <LiffStateHandler />
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

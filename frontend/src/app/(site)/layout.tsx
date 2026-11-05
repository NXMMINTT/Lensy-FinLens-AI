import type { Metadata } from "next";

import { LiffStateHandler } from "@/components/LiffStateHandler";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "FinLens AI — เทียบกองทุนเคียงกัน เห็นค่าธรรมเนียมแฝง กับน้อง Lensy",
  description: "น้อง Lensy อ่าน Fund Factsheet และหนังสือชี้ชวนของแต่ละกอง วางค่าใช้จ่ายทุกชั้นเทียบกัน บอกส่วนต่างเป็นบาท พร้อมเลขหน้าที่มา ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
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

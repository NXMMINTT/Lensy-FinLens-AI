import type { Metadata } from "next";

import { LiffStateHandler } from "@/components/LiffStateHandler";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "FinLens AI — จดบัญชีร้านแค่แชท LINE",
  description: "จดบัญชีร้านผ่าน LINE กับ U-Fox รู้ทันภาษี VAT และรู้ราคาคู่แข่งทุกแพลตฟอร์ม",
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

import type { Metadata } from "next";

import { LiffAuthGate } from "@/components/LiffAuthGate";
import { NavTabs, SiteHeader } from "@/components/NavTabs";
import { QueryProvider } from "@/components/QueryProvider";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "FinLens AI",
  description: "ผู้ช่วยบัญชีและนักวิเคราะห์ตลาดใน LINE สำหรับร้านค้าออนไลน์",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-screen bg-brand-tint font-sans text-[17px] leading-relaxed">
        <QueryProvider>
          <ThemeProvider>
            <I18nProvider>
              <LiffAuthGate>
                <div className="flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="mx-auto w-full max-w-[1160px] flex-1 px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-8">
                    {children}
                  </main>
                  <NavTabs />
                </div>
              </LiffAuthGate>
            </I18nProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

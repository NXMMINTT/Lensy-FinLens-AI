import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { FeatureMenu } from "@/components/finlens/app/FeatureMenu";
import { Icon } from "@/components/finlens/Icon";
import { MascotDecor } from "@/components/finlens/Decor";
import { Lensy } from "@/components/finlens/Lensy";
import { getVerifiedFunds } from "@/lib/funds";

export const metadata: Metadata = {
  title: "เมนู | FinLens AI",
  description: "เทียบค่าธรรมเนียมแฝงของกองทุน ดูทีละกอง คำนวณเป็นบาท และถามน้อง Lensy ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

/** Dashboard home after LINE login: just the menu; each tile opens its own page. */
export default function MenuPage() {
  const anySample = getVerifiedFunds().some((f) => f.meta.isSample);

  return (
    <AppShell sampleNote={anySample}>
      <header className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-gradient-to-br from-brand to-brand-dark px-6 py-6 text-white md:px-8">
        <div className="flex max-w-[620px] flex-col gap-2">
          <h1 className="m-0 text-[28px] font-bold leading-tight md:text-[36px]">สวัสดีค่ะ วันนี้อยากให้น้องช่วยเรื่องไหนคะ</h1>
          <p className="m-0 opacity-90">เลือกจากเมนูด้านล่างได้เลยค่ะ ตัวเลขของกองกดดูข้อความในเอกสารได้ทุกตัว</p>
          <p className="m-0 text-[14px] opacity-80">
            <Icon name="info" className="mr-1" />
            ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน
          </p>
        </div>
        <span className="relative mr-4 max-sm:hidden">
          <Lensy pose="wave" size={130} />
          <MascotDecor light />
        </span>
      </header>

      <FeatureMenu />
    </AppShell>
  );
}

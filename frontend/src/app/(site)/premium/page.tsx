import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { PricingTable } from "@/components/finlens/LandingSections";

export const metadata: Metadata = {
  title: "อัปเกรด Premium | FinLens AI",
  description: "ฟีเจอร์ของแผนฟรีและ Premium ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default function PremiumPage() {
  return (
    <AppShell sampleNote={false}>
      <PageHeader
        label="อัปเกรด Premium"
        title="ฟีเจอร์หลักใช้ฟรี"
        mark="Premium สำหรับดูทั้งพอร์ต"
        text="เทียบกองทุน ดูทีละกอง คำนวณเป็นบาท และถามน้อง Lensy ใช้ได้ฟรี Premium เพิ่มส่องพอร์ตและเช็กก่อนเชื่อ ช่วงเดโมยังไม่เปิดรับชำระเงิน"
        pose="heart"
      />
      <PricingTable />
    </AppShell>
  );
}

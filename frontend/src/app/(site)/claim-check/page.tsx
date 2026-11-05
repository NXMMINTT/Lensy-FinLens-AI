import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { PageHeader, SOON_BADGE } from "@/components/finlens/app/PageHeader";
import { PremiumPreview } from "@/components/finlens/app/PremiumPreview";
import { NOT_FOUND } from "@/lib/disclaimer";

export const metadata: Metadata = {
  title: "เช็กก่อนเชื่อ | FinLens AI",
  description: "เทียบข้อความโฆษณาหรือรีวิวกองทุนกับเอกสารจริง (Premium เร็ว ๆ นี้) ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default function ClaimCheckPage() {
  return (
    <AppShell sampleNote={false}>
      <PageHeader
        label="เช็กก่อนเชื่อ"
        badge={SOON_BADGE}
        title="เห็นโฆษณากองทุนแล้ว"
        mark="เช็กกับเอกสารจริงก่อน"
        text="วางข้อความโฆษณา โพสต์รีวิว หรือคำแนะนำที่ได้รับมา น้อง Lensy จะหาในเอกสารของกองนั้นว่าตรงกันไหม"
        pose="laptop"
      />
      <PremiumPreview
        steps={["วางข้อความที่อยากเช็ก และเลือกกองที่พูดถึง", "น้องหาข้อความที่เกี่ยวข้องใน Factsheet และหนังสือชี้ชวน แล้วโค้ดตรวจซ้ำว่ามีอยู่จริงในหน้านั้น", "วางข้อความโฆษณาคู่กับข้อความในเอกสาร พร้อมเลขหน้า"]}
        shows={[
          "ข้อความในเอกสารที่ตรงกับแต่ละประโยค พร้อมเลขหน้าให้เปิดตรวจเอง",
          "เรื่องที่โฆษณาไม่ได้พูดถึง เช่น ค่าใช้จ่ายของกองทุนหลัก หรือการป้องกันค่าเงิน",
          `ถ้าเอกสารไม่มีเรื่องนั้น น้องจะบอกตรง ๆ ว่า “${NOT_FOUND}”`,
        ]}
        promise="น้องไม่ตัดสินว่าโฆษณาจริงหรือหลอก และไม่บอกว่าควรซื้อหรือไม่ แค่วางข้อความกับเอกสารคู่กันให้ดูค่ะ"
      />
    </AppShell>
  );
}

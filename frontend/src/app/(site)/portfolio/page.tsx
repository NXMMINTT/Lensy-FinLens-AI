import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { PageHeader, SOON_BADGE } from "@/components/finlens/app/PageHeader";
import { PremiumPreview } from "@/components/finlens/app/PremiumPreview";

export const metadata: Metadata = {
  title: "ส่องพอร์ต | FinLens AI",
  description: "รวมค่าใช้จ่ายและความเสี่ยงของทุกกองที่ถือ (Premium เร็ว ๆ นี้) ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default function PortfolioPage() {
  return (
    <AppShell sampleNote={false}>
      <PageHeader
        label="ส่องพอร์ต"
        badge={SOON_BADGE}
        title="ค่าใช้จ่ายของทั้งพอร์ต"
        mark="ในที่เดียว"
        text="ถือหลายกองแล้วไม่รู้ว่ารวมกันเสียค่าใช้จ่ายเท่าไหร่ น้อง Lensy จะรวมให้ และชี้ความเสี่ยงที่ซ้อนกันอยู่"
        pose="chart"
      />
      <PremiumPreview
        steps={["เลือกกองที่ถืออยู่ และใส่จำนวนเงินของแต่ละกอง", "น้องรวมต้นทุนต่อปีของทุกกอง ทุกชั้น จากเอกสารที่ทีมตรวจแล้ว", "สรุปเป็นเงินบาทต่อปี และชี้เรื่องที่ซ้อนกันหลายกอง"]}
        shows={[
          "ต้นทุนต่อปีรวมของทั้งพอร์ต เป็นเปอร์เซ็นต์และเป็นบาท พร้อมเลขหน้าของแต่ละกอง",
          "กองไหนมีค่าใช้จ่ายของกองทุนหลักซ่อนอยู่อีกชั้น",
          "ความเสี่ยงที่ซ้อนกัน เช่น หลายกองไม่ป้องกันค่าเงิน หรือลงทุนในประเทศเดียวกัน",
        ]}
        promise="น้องจะไม่บอกว่าควรขายหรือย้ายกองไหน และไม่จัดอันดับกองในพอร์ต แค่วางข้อมูลให้เห็นครบค่ะ"
      />
    </AppShell>
  );
}

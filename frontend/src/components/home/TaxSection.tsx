import { FeatureSection } from "@/components/home/FeatureSection";
import { Phone } from "@/components/home/phone/Phone";
import { ProfitSummaryCard } from "@/components/home/screens/ProfitSummaryCard";
import { TaxAlertScreen } from "@/components/home/screens/TaxAlertScreen";
import { Sprinkles } from "@/components/home/Sprinkles";
import { TaxPlayground } from "@/components/home/TaxPlayground";

export function TaxSection() {
  return (
    <FeatureSection
      id="tax"
      title={<>เพดานภาษี<br /><span className="text-brand">ไม่ต้องลุ้นเอง</span></>}
      intro="แพลตฟอร์มต้องส่งข้อมูลรายได้ให้สรรพากรแล้ว U-Fox คอยเฝ้ายอดขายของคุณเทียบเพดาน VAT 1.8 ล้านบาทให้ทุกวัน"
      steps={[
        ["มิเตอร์ภาษี เขียว เหลือง แดง", "เห็นทันทีว่ายอดขายสะสมใกล้ 1.8 ล้านบาทแค่ไหน"],
        ["เตือนใน LINE ล่วงหน้า", "ทุกครั้งที่ยอดขายข้ามโซน U-Fox ทักไปบอกพร้อมสิ่งที่ต้องเตรียม"],
        ["สรุปกำไร พร้อมยื่น", "รายรับ รายจ่าย กำไรสุทธิ และสินค้าขายดี ดูได้ในหน้าเว็บ"],
      ]}
      visuals={[
        <TaxPlayground key="meter" />,
        <Phone key="alert">
          <TaxAlertScreen />
        </Phone>,
        <ProfitSummaryCard key="summary" />,
      ]}
      decor={<Sprinkles mirror />}
      visualFirst
    />
  );
}

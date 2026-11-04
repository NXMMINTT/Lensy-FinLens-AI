import { UFox } from "@/components/brand/UFox";
import { FeatureSection } from "@/components/home/FeatureSection";
import { Phone } from "@/components/home/phone/Phone";
import { KeywordScreen } from "@/components/home/screens/KeywordScreen";
import { PriceRadarScreen } from "@/components/home/screens/PriceRadarScreen";
import { WhereToSellScreen } from "@/components/home/screens/WhereToSellScreen";
import { Sprinkles } from "@/components/home/Sprinkles";

export function CompetitorSection() {
  return (
    <FeatureSection
      id="radar"
      premium
      title={<>ส่องราคาคู่แข่ง<br /><span className="text-brand">แบบเนียนๆ</span></>}
      intro="Market Radar เทียบราคาคู่แข่งทุกแพลตฟอร์มกับต้นทุนจริงที่คุณจดไว้ แล้ว U-Fox บอกว่าควรตั้งราคาเท่าไหร่"
      steps={[
        ["ราคาที่ขายออกและยังกำไร", "ปักหมุดต้นทุนของร้านบนกราฟราคาคู่แข่ง เห็นช่องว่างทันที"],
        ["ควรไปขายที่ไหน", "ยอดขายสินค้าแบบเดียวกันบน Shopee, Lazada, TikTok Shop, Amazon และอื่นๆ"],
        ["คำค้นยอดฮิต และโอกาสส่งออกยุโรป", "ใช้ตั้งชื่อสินค้า ยิงโฆษณา หรือหาตลาดใหม่"],
      ]}
      visuals={[<PriceRadarScreen key="price" />, <WhereToSellScreen key="where" />, <KeywordScreen key="keywords" />].map((screen) => (
        <Phone key={screen.key}>{screen}</Phone>
      ))}
      decor={
        <>
          <UFox pose="radar" size={150} className="absolute -bottom-6 -left-24 z-[1] max-sm:-left-6" />
          <Sprinkles />
        </>
      }
    />
  );
}

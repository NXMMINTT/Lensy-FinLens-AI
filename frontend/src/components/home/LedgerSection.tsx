import { UFox } from "@/components/brand/UFox";
import { FeatureSection } from "@/components/home/FeatureSection";
import { Phone } from "@/components/home/phone/Phone";
import { SlipScreen } from "@/components/home/screens/SlipScreen";
import { TextEntryScreen } from "@/components/home/screens/TextEntryScreen";
import { VoiceScreen } from "@/components/home/screens/VoiceScreen";
import { Sprinkles } from "@/components/home/Sprinkles";

export function LedgerSection() {
  return (
    <FeatureSection
      id="ledger"
      title={<>จดบัญชี<br />แบบคน<span className="text-brand">ขี้เกียจ</span></>}
      intro="ไม่ต้องเปิด Excel ไม่ต้องหาสมุด ทักแชทเหมือนคุยกับเพื่อน U-Fox แปลงเป็นบัญชีและตัดสต็อกให้"
      steps={[
        ["พิมพ์เหมือนแชทปกติ", "“ขายน้ำพริก 20 กระปุก 1780” แล้ว U-Fox แยกรายรับ รายจ่าย และสินค้าให้"],
        ["ถ่ายรูปสลิปส่งมา", "U-Fox อ่านยอดเงินจากรูป แล้วส่งการ์ดมาให้กดยืนยันทีเดียว"],
        ["ขี้เกียจพิมพ์? อัดเสียงเลย", "ขับรถส่งของอยู่ก็จดได้ พูดว่า “ซื้อพริกแห้ง 2 กระสอบ 900”"],
      ]}
      visuals={[<TextEntryScreen key="text" />, <SlipScreen key="slip" />, <VoiceScreen key="voice" />].map((screen) => (
        <Phone key={screen.key}>{screen}</Phone>
      ))}
      decor={
        <>
          <UFox pose="ledger" size={150} className="absolute -bottom-6 -right-20 z-[1] max-sm:-right-2 max-sm:w-[110px]" />
          <Sprinkles />
        </>
      }
    />
  );
}

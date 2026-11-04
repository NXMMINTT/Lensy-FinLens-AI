import Image from "next/image";
import { ChatShell } from "@/components/home/phone/ChatShell";
import { UserBubble } from "@/components/home/phone/UserBubble";

/** Tax step 2: U-Fox pushes a heads-up when sales cross into the next zone.
 *  Compact copy of backend/app/line_messages/assets/flex_tax_yellow.json */
export function TaxAlertScreen() {
  return (
    <ChatShell>
      <div className="w-[225px] shrink-0 self-start overflow-hidden rounded-[14px] bg-[#FFFFFF] text-[#1B2559]">
        <Image src="/line/banner-tax-yellow.jpg" alt="" width={1040} height={294} sizes="225px" className="h-auto w-full" />
        <div className="px-2.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[#8A91A3]">ยอดขายสะสมปีนี้</span>
            <span className="rounded-xl bg-[#FFF4D6] px-2 py-px text-[10px] font-bold text-[#8A5A00]">70%</span>
          </div>
          <div className="text-[22px] font-bold leading-tight">฿1,262,000</div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#FBE9BC]">
            <div className="h-full w-[70%] rounded-full bg-[#F5B82E]" />
          </div>
          <div className="mt-0.5 flex justify-between text-[9px]">
            <span className="text-[#8A91A3]">70% ของเพดาน ฿1,800,000</span>
            <b className="text-[#8A5A00]">เหลืออีก ฿538,000</b>
          </div>
          <b className="mt-2 block">สิ่งที่ควรเตรียมไว้ค่ะ</b>
          <div className="mt-1 flex flex-col gap-1">
            {["เก็บใบเสร็จค่าวัตถุดิบให้ครบ", "เช็กยอดขายทุกแพลตฟอร์มให้ตรง", "ถ้าเกินเพดาน จด VAT ภายใน 30 วัน"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-[12px] bg-[#FFF4D699] px-2 py-1">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-[#F5B82E] text-[10px] font-bold text-[#FFFFFF]">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="px-2.5 pb-1 pt-2">
          <span className="block rounded-md bg-[#D18E00] py-1.5 text-center font-bold text-[#FFFFFF]">ดูรายละเอียดภาษี</span>
          <span className="block py-1 text-center text-[#8A91A3]">เตือนอีกครั้งเดือนหน้า</span>
        </div>
      </div>
      <UserBubble>โอเค ขอบคุณนะ</UserBubble>
    </ChatShell>
  );
}

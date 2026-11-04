import { LineAddFriendButton } from "@/components/brand/LineAddFriendButton";
import { UFox } from "@/components/brand/UFox";
import { Twinkle } from "@/components/decor/Twinkle";
import { PlanReceipt } from "@/components/home/PlanReceipt";

export function PricingSection() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 px-6 pb-24">
      <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-9">
        <div className="relative text-center">
          <UFox pose="love" size={120} className="absolute -left-36 -top-6 max-lg:hidden" />
          <Twinkle className="-right-14 -top-2 h-7 w-7 max-lg:hidden" />
          <Twinkle className="-right-6 top-8 h-3.5 w-3.5 max-lg:hidden" color="#1A7637" />
          <h2 id="pricing-title" className="m-0 text-[40px] font-extrabold">
            เริ่ม<span className="text-brand">ฟรี</span> จ่ายเมื่ออยากรู้ใจคู่แข่ง
          </h2>
          <p className="m-0 mt-2 text-ink-muted">ราคาเป็นมิตรเหมือนแม่ค้าข้างบ้าน ยกเลิกเมื่อไหร่ก็ได้</p>
        </div>
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-8">
          <PlanReceipt
            name="Free"
            subtitle="ร้านของฉัน — จดบัญชีผ่าน LINE"
            price="฿0"
            lines={["จดด้วยข้อความ สลิป และเสียง", "ตัดสต็อกอัตโนมัติ", "มิเตอร์ภาษี VAT และแจ้งเตือน", "สรุปรายรับ รายจ่าย กำไร"]}
          />
          <PlanReceipt
            highlight
            name="Premium"
            subtitle="ทุกอย่างใน Free + Market Radar"
            price="฿199"
            per="/ เดือน"
            lines={["ราคาคู่แข่งทุกแพลตฟอร์ม เทียบต้นทุนจริง", "U-Fox แนะนำราคาขาย", "คำค้นยอดฮิต และเทรนด์ข้ามแพลตฟอร์ม", "โอกาสส่งออกตลาดยุโรป"]}
          />
        </div>
        <LineAddFriendButton />
      </div>
    </section>
  );
}

import { LineAddFriendButton } from "@/components/brand/LineAddFriendButton";
import { Paw } from "@/components/decor/Paw";
import { Twinkle } from "@/components/decor/Twinkle";
import { FeatureCard } from "@/components/home/FeatureCard";
import { MiniPhone } from "@/components/home/MiniPhone";
import { InfoRow } from "@/components/home/phone/InfoRow";

export function OtherFeaturesSection() {
  return (
    <section aria-label="ฟีเจอร์อื่นๆ" className="px-6 pb-24">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-10">
        <div className="flex flex-col items-center gap-4 rounded-[32px] bg-surface p-9 text-center">
          <h2 className="m-0 text-[28px] font-bold">
            จดกับ U-Fox วันนี้ แล้วรู้ว่าร้าน<span className="text-brand">กำไรจริง</span>เท่าไหร่
          </h2>
          <LineAddFriendButton />
        </div>
        <div className="relative flex flex-col gap-8 rounded-[36px] bg-surface px-6 py-11 md:px-9">
          <Twinkle className="left-8 top-8 h-6 w-6 max-md:hidden" />
          <Twinkle className="left-16 top-16 h-3.5 w-3.5 max-md:hidden" color="#D1F08F" />
          <Paw className="right-10 top-9 h-7 w-7 rotate-12 opacity-80 max-md:hidden" />
          <h2 className="m-0 text-center text-[38px] font-bold leading-tight">
            นอกจากนี้ U-Fox <span className="text-brand">ทำได้อีกเยอะ</span>
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-6">
            <FeatureCard fox="commerce" title="ตัดสต็อกอัตโนมัติ" body="ยืนยันการขายแล้วสต็อกลดเอง ซื้อของเข้าก็บันทึกต้นทุนให้" tag="ขายไป 20 · เหลือ 120">
              <MiniPhone>
                <b>สต็อกสินค้า</b>
                <InfoRow k="น้ำพริกตาแดง" v="120" />
                <InfoRow k="กระเป๋าผ้าทอ" v="40" />
                <InfoRow k="สบู่มะกรูด" v="300" />
              </MiniPhone>
            </FeatureCard>
            <FeatureCard fox="idea" title="สรุปยอดทุกวัน" body="พิมพ์ “สรุป” U-Fox ตอบยอดขาย รายจ่าย และกำไรของวันนี้ทันที" tag="พิมพ์คำเดียว" tagLeft>
              <MiniPhone chat>
                <span className="self-end rounded-xl bg-chat px-2.5 py-1">สรุป</span>
                <div className="rounded-xl bg-surface px-2.5 py-2">
                  <b>วันนี้</b>
                  <div>รายรับ ฿4,630</div>
                  <div>รายจ่าย ฿1,145</div>
                  <b className="text-brand">กำไร ฿3,485</b>
                </div>
              </MiniPhone>
            </FeatureCard>
            <FeatureCard fox="line" title="U-Fox ตอบเป็นเสียง" body="ถามเรื่องกำไร ภาษี หรือราคา แล้วฟังคำตอบได้ ไม่ต้องอ่าน" tag="เดือนนี้กำไรเท่าไหร่?">
              <div className="grid h-full place-items-center">
                <div className="flex items-center gap-3 rounded-full bg-surface px-5 py-3.5 shadow-[0_10px_24px_rgba(26,111,214,.12)]">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                  <span className="flex items-center gap-1" aria-hidden="true">
                    {[12, 24, 16, 30, 18, 26, 12, 20].map((h, i) => (
                      <span key={i} className={`w-1 rounded-sm ${i % 2 ? "bg-brand" : "bg-brand-light"}`} style={{ height: h }} />
                    ))}
                  </span>
                  <b>0:12</b>
                </div>
              </div>
            </FeatureCard>
            <FeatureCard fox="global" title="วัตถุดิบราคาส่งจากพาร์ทเนอร์" body="ตอนสินค้าของคุณกำลังมาแรง ร้านค้าส่งอย่าง Thai Mart เสนอวัตถุดิบให้ตุนก่อน">
              <div className="grid h-full place-items-center">
                <div className="flex w-[290px] flex-col gap-1 rounded-[20px] bg-surface px-5 py-4 text-[15px] shadow-[0_10px_24px_rgba(26,111,214,.12)]">
                  <span className="self-start rounded-full bg-sun-soft px-2.5 py-0.5 text-xs font-bold text-sun-ink">ผู้สนับสนุน · Thai Mart</span>
                  <b>พริกแห้งเกรดเอ 5 กก.</b>
                  <InfoRow k="ขั้นต่ำ 2 กระสอบ" v="฿450" />
                </div>
              </div>
            </FeatureCard>
          </div>
        </div>
      </div>
    </section>
  );
}

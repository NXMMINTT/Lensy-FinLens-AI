import { LineAddFriendButton } from "@/components/brand/LineAddFriendButton";
import { UFoxLive } from "@/components/brand/UFoxLive";
import { Twinkle } from "@/components/decor/Twinkle";
import { Phone } from "@/components/home/phone/Phone";
import { HeroChatScreen } from "@/components/home/screens/HeroChatScreen";
import { Sprinkles } from "@/components/home/Sprinkles";

export function HeroSection() {
  return (
    <section aria-label="FinLens AI" className="relative bg-surface">
      {/* header + hero fit one screen on desktop */}
      <div className="relative mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-6 py-8 lg:h-[calc(100svh-68px)] lg:min-h-[520px] lg:flex-nowrap lg:py-6">
        {/* same twinkles and paws as around the phone, spread over the empty areas (desktop only) */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 max-lg:hidden">
          <Twinkle className="left-[46%] top-[11%] h-7 w-7" />
          <Twinkle className="left-[49%] top-[19%] h-3.5 w-3.5" color="#1A7637" />
          <Twinkle className="bottom-[14%] left-[54%] h-5 w-5" color="#D1F08F" />
        </span>
        <div className="relative flex min-w-0 flex-[1_1_480px] flex-col gap-5">
          <span className="self-start rounded-full bg-brand-soft px-3.5 py-1 text-[15px] font-semibold text-brand">
            U-Fox ผู้ช่วยบัญชีประจำร้านใน LINE
          </span>
          <h1 className="m-0 text-[38px] font-extrabold leading-[1.25] tracking-tight md:text-[48px]">
            ขายของอย่างเดียว
            <br />
            เรื่องบัญชีให้ <span className="text-brand">U-Fox จัดการ</span>
          </h1>
          <p className="m-0 max-w-[520px] text-lg text-ink-body">
            ส่งสลิป พิมพ์ หรืออัดเสียงในแชท U-Fox จดบัญชี ตัดสต็อก เฝ้าเพดานภาษี แล้วยังแอบไปส่องราคาคู่แข่งมาให้ด้วย
          </p>
          <div className="flex flex-wrap items-end gap-x-12 gap-y-6">
            <div>
              <div className="text-[15px] text-ink-muted">เฝ้าเพดาน VAT ให้</div>
              <div className="text-[40px] font-extrabold leading-tight text-brand">฿1.8 ล้าน</div>
            </div>
            <div>
              <div className="text-[15px] text-ink-muted">ส่องราคาคู่แข่ง</div>
              <div className="text-[40px] font-extrabold leading-tight text-brand">
                60+ <span className="text-lg font-semibold text-ink">แพลตฟอร์ม</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <LineAddFriendButton label="เพิ่มเพื่อน U-Fox ฟรี" />
            <span className="text-[15px] text-ink-muted">จดบัญชีฟรีตลอด · Market Radar ลองฟรี 7 วัน</span>
          </div>
        </div>

        <div className="relative flex min-w-0 flex-[1_1_520px] justify-center">
          <div className="relative">
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-soft to-surface max-lg:hidden" />
            <div className="relative">
              <Phone tall>
                <HeroChatScreen />
              </Phone>
            </div>
            <UFoxLive size={180} wave className="!absolute -bottom-4 -right-[140px] max-md:-right-10 max-md:[&_img]:!h-[150px] max-md:[&_img]:!w-[150px]" />
            <Sprinkles />
          </div>
        </div>
      </div>
    </section>
  );
}

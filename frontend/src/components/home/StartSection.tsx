import { LineAddFriendButton } from "@/components/brand/LineAddFriendButton";
import { UFoxLive } from "@/components/brand/UFoxLive";
import { Curl } from "@/components/decor/Curl";
import { Paw } from "@/components/decor/Paw";
import { Twinkle } from "@/components/decor/Twinkle";

export function StartSection() {
  return (
    <section aria-label="เริ่มใช้งาน" className="px-6 pb-24">
      <div className="relative mx-auto flex max-w-[1100px] flex-col items-center gap-5 overflow-hidden rounded-[36px] bg-surface px-9 py-14 text-center">
        <Twinkle className="left-[12%] top-12 h-8 w-8" />
        <Twinkle className="left-[18%] top-24 h-4 w-4" color="#BBD8FB" />
        <Paw className="bottom-14 left-[14%] h-9 w-9 -rotate-12 opacity-80 max-sm:hidden" />
        <Twinkle className="right-[14%] top-16 h-5 w-5" color="#1A7637" />
        <Curl className="bottom-16 right-[13%] h-9 w-9 max-sm:hidden" />
        <h2 className="m-0 text-[40px] font-bold leading-tight">
          เริ่มจดกับ U-Fox
          <br />
          แล้วรู้ว่าร้าน<span className="text-brand">ควรขายเท่าไหร่</span>
        </h2>
        <p className="m-0 text-ink-muted">เพิ่มเพื่อน U-Fox บน LINE แล้วส่งรายการแรกได้เลยวันนี้</p>
        <UFoxLive size={200} wave bubbleSide="right" />
        <LineAddFriendButton />
      </div>
    </section>
  );
}

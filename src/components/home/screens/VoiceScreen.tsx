import { ChatShell } from "@/components/home/phone/ChatShell";
import { ConfirmCard } from "@/components/home/phone/ConfirmCard";
import { SavedReply } from "@/components/home/phone/SavedReply";

export function VoiceScreen() {
  return (
    <ChatShell>
      <span className="flex shrink-0 items-center gap-2 self-end rounded-[14px] rounded-br-sm bg-chat px-3 py-2 text-[#0F2A12]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        <span className="flex items-center gap-[3px]">
          {[6, 12, 8, 14, 10, 16, 7, 12, 9, 5].map((h, i) => (
            <span key={i} className="w-[3px] rounded-sm bg-[#0F2A12]/60" style={{ height: h }} />
          ))}
        </span>
        <b>0:04</b>
      </span>
      <ConfirmCard
        kind="expense"
        amount="900.00"
        quote="ซื้อพริกแห้ง 2 กระสอบ 900"
        rows={[["category", "หมวดหมู่", "วัตถุดิบ"], ["note", "รายการ", "พริกแห้ง ×2 กระสอบ"]]}
      />
      <SavedReply />
    </ChatShell>
  );
}

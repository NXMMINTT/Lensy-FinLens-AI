import { ChatShell } from "@/components/home/phone/ChatShell";
import { ConfirmCard } from "@/components/home/phone/ConfirmCard";
import { SavedReply } from "@/components/home/phone/SavedReply";
import { UserBubble } from "@/components/home/phone/UserBubble";

export function TextEntryScreen() {
  return (
    <ChatShell>
      <UserBubble>ขายน้ำพริก 20 กระปุก 1780</UserBubble>
      <ConfirmCard
        kind="income"
        amount="1,780.00"
        quote="ขายน้ำพริก 20 กระปุก 1780"
        rows={[["category", "หมวดหมู่", "ขายสินค้า"], ["note", "รายการ", "น้ำพริก ×20"]]}
      />
      <SavedReply>ตัดสต็อกน้ำพริก เหลือ 120</SavedReply>
    </ChatShell>
  );
}

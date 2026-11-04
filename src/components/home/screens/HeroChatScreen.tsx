import Image from "next/image";
import { ChatHeader } from "@/components/home/phone/ChatHeader";
import { ConfirmCard } from "@/components/home/phone/ConfirmCard";
import { UserBubble } from "@/components/home/phone/UserBubble";

export function HeroChatScreen() {
  return (
    <>
      <ChatHeader />
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden p-2.5">
        <UserBubble>ขายน้ำพริก 20 กระปุก 1780</UserBubble>
        <ConfirmCard kind="income" amount="1,780.00" quote="ขายน้ำพริก 20 กระปุก 1780" />
      </div>
      {/* LINE rich menu — same image as backend/app/line_messages/assets/rich_menu.jpg */}
      <Image src="/line/rich-menu.jpg" alt="" width={2500} height={1686} sizes="260px" className="h-auto w-full shrink-0" />
    </>
  );
}

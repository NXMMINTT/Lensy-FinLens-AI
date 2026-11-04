import { UserBubble } from "@/components/home/phone/UserBubble";

/** What happens after tapping the card's confirm button (text from backend/app/locales/th.py). */
export function SavedReply({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <UserBubble>ยืนยันบันทึก</UserBubble>
      <span className="max-w-[210px] shrink-0 self-start rounded-[14px] rounded-bl-sm bg-surface px-2.5 py-1.5">
        บันทึกเรียบร้อยแล้วครับ ✅{children && <span className="block text-ink-muted">{children}</span>}
      </span>
    </>
  );
}

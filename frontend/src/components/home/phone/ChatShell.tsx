import { ChatHeader } from "@/components/home/phone/ChatHeader";

/** LINE chat with the message input bar at the bottom. */
export function ChatShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ChatHeader />
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden p-2.5">{children}</div>
      <div className="flex items-center gap-2 bg-surface px-3 py-2.5 text-ink-muted">
        <span className="text-lg leading-none">+</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="14" rx="3" /><circle cx="12" cy="13" r="3.5" /></svg>
        <span className="flex-1 rounded-full bg-line-subtle px-3 py-1.5">Aa</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
      </div>
    </>
  );
}

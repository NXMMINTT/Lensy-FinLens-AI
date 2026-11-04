/** Set NEXT_PUBLIC_LINE_ADD_FRIEND_URL to the OA's https://line.me/R/ti/p/@… link. */
export const LINE_ADD_FRIEND_URL = process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL ?? "#";

export function LineAddFriendButton({ label = "เพิ่มเพื่อน", className = "" }: { label?: string; className?: string }) {
  return (
    <a
      href={LINE_ADD_FRIEND_URL}
      className={`inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-linegreen px-7 font-bold text-white no-underline shadow-[0_10px_24px_rgba(6,199,85,.3)] hover:bg-[#05B34C] ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5s5.9-3.5 8.1-6C21.4 14.3 22 12.7 22 11c0-4.4-4.5-8-10-8z" />
      </svg>
      {label}
    </a>
  );
}

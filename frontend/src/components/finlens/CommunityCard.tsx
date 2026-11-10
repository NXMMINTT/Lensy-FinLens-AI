import { Lensy } from "./Lensy";

/** LINE OpenChat of FinLens Community; the card stays hidden on the live site until it is set. */
const COMMUNITY_URL = process.env.NEXT_PUBLIC_LINE_COMMUNITY_URL?.trim() || "";

/**
 * A free LINE community for people interested in the same kind of investment: to learn and swap
 * experience, never buy/sell calls. No referral code, no "special rights", no promised returns
 * (the wording follows the team's legal notes: advice and solicitation need a licence).
 */
export function CommunityCard() {
  // in development the card shows without a link, so its look can be checked before the room exists
  if (!COMMUNITY_URL && process.env.NODE_ENV === "production") return null;

  return (
    <section
      aria-labelledby="community-title"
      className="relative overflow-hidden rounded-[24px] border border-brand/15 bg-gradient-to-br from-brand-soft via-brand-tint to-surface px-6 py-7 md:px-9 md:py-8"
    >
      <div className="relative flex max-w-[600px] flex-col gap-3">
        <span className="text-[13px] font-bold uppercase tracking-wider text-brand">FinLens Community</span>
        <h2 id="community-title" className="m-0 text-[24px] font-bold leading-snug text-ink md:text-[30px]">
          <span className="whitespace-nowrap">ลงทุนแนวเดียวกัน</span> <span className="whitespace-nowrap">เรียนรู้ไปด้วยกัน</span>
        </h2>
        <p className="m-0 text-[16px] leading-relaxed text-ink-body">
          พบปะและแลกเปลี่ยนประสบการณ์กับผู้ที่สนใจกองทุนหรือแนวทางการลงทุนคล้ายกัน พูดคุยเรื่องความเสี่ยง ค่าธรรมเนียม และข้อมูลที่ตรวจสอบได้ ในชุมชนฟรีของ FinLens AI
        </p>
        {COMMUNITY_URL ? (
          <a
            href={COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex min-h-[52px] items-center justify-center gap-2.5 self-stretch rounded-full bg-linegreen px-7 font-bold text-white no-underline shadow-[0_10px_24px_rgba(6,199,85,.3)] hover:bg-[#05B34C] sm:self-start"
          >
            <LineBubble />
            เข้าร่วมชุมชนฟรีผ่าน LINE
          </a>
        ) : (
          <span className="mt-1 inline-flex min-h-[52px] items-center justify-center gap-2.5 self-stretch rounded-full bg-linegreen/50 px-7 font-bold text-white sm:self-start">
            <LineBubble />
            เข้าร่วมชุมชนฟรีผ่าน LINE
          </span>
        )}
        <p className="m-0 text-[13.5px] leading-relaxed text-ink-muted">
          ชุมชนนี้มีไว้เพื่อการศึกษาและแลกเปลี่ยนความคิดเห็น ไม่ให้คำแนะนำการลงทุนเฉพาะบุคคล ไม่รับบริหารเงินลงทุน และไม่รับประกันผลตอบแทน
        </p>
      </div>
      <span aria-hidden="true" className="absolute bottom-0 right-6 hidden md:block">
        <Lensy pose="heart" size={170} />
      </span>
    </section>
  );
}

/** The LINE speech bubble, as on the add-friend button. */
function LineBubble() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5s5.9-3.5 8.1-6C21.4 14.3 22 12.7 22 11c0-4.4-4.5-8-10-8z" />
    </svg>
  );
}

"use client";

import { useEffect, useState } from "react";

/**
 * "สมัครเพื่อลงทุน" on a fund page: the fund's Factsheet on its management company's site, and a
 * referral code made for this visitor and this fund (kept in this browser only, nothing is sent or
 * stored on a server). The card says plainly that FinLens may be paid for sign-ups with the code and
 * that this is not a recommendation; whether a partner accepts the code, and any pay for it, needs
 * the team's legal check before it goes live (see README, known limits).
 */
export function FundReferralCard({ code, nameTh, factsheetUrl }: { code: string; nameTh: string; factsheetUrl: string | null }) {
  const [ref, setRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const key = `fl-ref-${code}`;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(key);
    } catch {
      // private window or blocked storage: a fresh code each visit is fine
    }
    const next = saved ?? makeCode(code);
    try {
      if (!saved) localStorage.setItem(key, next);
    } catch {
      // see above
    }
    setRef(next);
  }, [code]);

  async function copy() {
    if (!ref) return;
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked: the code is still on screen to copy by hand
    }
  }

  return (
    <section aria-labelledby="referral-title" className="flex flex-col gap-4 rounded-[24px] border border-line bg-surface px-6 py-6 md:px-8">
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-bold uppercase tracking-wider text-brand">สมัครเพื่อลงทุน</span>
        <h2 id="referral-title" className="m-0 text-[20px] font-bold leading-snug text-ink">
          สนใจ {code}?
        </h2>
        <p className="m-0 text-[15px] text-ink-body">อ่านข้อมูลกองจากบริษัทจัดการก่อน แล้วใช้รหัสแนะนำของคุณตอนสมัคร</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {factsheetUrl ? (
          <a
            href={factsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[64px] flex-col justify-center rounded-2xl border border-line px-4 py-3 no-underline transition hover:border-brand hover:bg-brand-tint"
          >
            <span className="text-[13px] text-ink-muted">ลิงก์กองทุน</span>
            <span className="font-bold text-brand">Factsheet {nameTh} ↗</span>
          </a>
        ) : (
          <div className="flex min-h-[64px] flex-col justify-center rounded-2xl border border-dashed border-line px-4 py-3">
            <span className="text-[13px] text-ink-muted">ลิงก์กองทุน</span>
            <span className="text-[14px] text-ink-muted">ยังไม่มีลิงก์ Factsheet บนเว็บบริษัทจัดการของกองนี้</span>
          </div>
        )}

        <div className="flex min-h-[64px] items-center justify-between gap-3 rounded-2xl bg-brand-tint px-4 py-3">
          <span className="flex min-w-0 flex-col">
            <span className="text-[13px] text-ink-muted">รหัสแนะนำของคุณ</span>
            <code className="truncate font-heading text-[20px] font-bold tracking-wider text-ink">{ref ?? "…"}</code>
          </span>
          <button
            type="button"
            onClick={copy}
            disabled={!ref}
            className="shrink-0 rounded-full bg-brand px-4 py-2 text-[14px] font-bold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {copied ? "คัดลอกแล้ว" : "คัดลอก"}
          </button>
        </div>
      </div>

      <p className="m-0 text-[13px] leading-relaxed text-ink-muted">
        รหัสนี้ใช้บอกผู้ให้บริการว่าคุณมาจาก FinLens AI ไม่มีสิทธิพิเศษหรือส่วนลด และ FinLens AI อาจได้รับค่าตอบแทนเมื่อมีการสมัครด้วยรหัสนี้
        ซึ่งไม่มีผลต่อข้อมูลและการเปรียบเทียบบนเว็บ ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำให้ลงทุนในกองนี้
      </p>
    </section>
  );
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I: easy to read out

/** "KFUS-A" -> "FL-KFUSA-7Q2X": the fund, then 4 random characters. */
function makeCode(fund: string): string {
  const part = fund.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "FUND";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const tail = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `FL-${part}-${tail}`;
}

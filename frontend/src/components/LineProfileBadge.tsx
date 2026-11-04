"use client";

import { useEffect, useRef, useState } from "react";

import { clearStoredJwt } from "@/lib/api-client";
import { getLineProfile, type LineProfile, liffLogout } from "@/lib/liff";

/** Shows the signed-in LINE user's name + avatar with a logout menu, so it's clear
 * the session is a real LINE login. */
export function LineProfileBadge() {
  const [profile, setProfile] = useState<LineProfile | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getLineProfile().then(setProfile);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function logout() {
    clearStoredJwt();
    liffLogout();
    window.location.href = "/";
  }

  if (!profile) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-line px-1.5 py-1 hover:border-brand"
      >
        {profile.pictureUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.pictureUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        )}
        <span className="max-w-[120px] truncate text-[15px] font-semibold text-ink">{profile.displayName}</span>
        <svg className="h-4 w-4 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-44 overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-[15px] font-medium text-expense hover:bg-line-subtle"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}
